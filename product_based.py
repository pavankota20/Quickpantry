#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Mar 10 23:31:57 2024

@author: pavankumarkotapally
"""

from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALSModel
from pyspark.sql.functions import udf, col, array, lit
from pyspark.sql.types import FloatType
from pyspark.ml.linalg import Vectors
import numpy as np

class ItemRecommendation:
    def __init__(self, model_path, products_file):
        self.spark = SparkSession.builder \
            .appName("Item Similarity and Recommendation") \
            .getOrCreate()
        self.model = ALSModel.load(model_path)
        self.product_df = self.spark.read.csv(products_file, header=True, inferSchema=True)
        self.itemFactors = self.model.itemFactors
        self.broadcast_item_factors = None

    # UDF for calculating cosine similarity
    @staticmethod
    @udf(FloatType())
    def cosine_similarity(v1, v2):
        v1 = np.array(v1)
        v2 = np.array(v2)
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

    def prepare_data(self):
        # Prepare data for similarity computation - collect item factors
        item_factors = self.itemFactors.rdd.map(lambda x: (x['id'], x['features'])).collectAsMap()

        # Broadcast the collected item factors
        self.broadcast_item_factors = self.spark.sparkContext.broadcast(item_factors)

    def calculate_similarities(self, target_item_id):
        target_factors = Vectors.dense(self.broadcast_item_factors.value[target_item_id])

        # Adding a column with target item factors for each row to compute similarities
        self.itemFactors = self.itemFactors.withColumn("target_factors", array([lit(x) for x in target_factors]))

        # Compute similarities with the target item
        self.itemFactors = self.itemFactors.withColumn("similarity", self.cosine_similarity(col("features"), col("target_factors")))

    def get_recommendations(self):
        # Ensure the join keys ('product_id' in product_df and 'id' in itemFactors) match in type and name, or adjust accordingly
        combined_df = self.product_df.join(self.itemFactors, self.product_df.product_id == self.itemFactors.id)

        # Select the desired columns
        result_df = combined_df.select("product_id", "product_name", "similarity")

        # Order the result DataFrame by the similarity column in descending order
        ordered_result_df = result_df.orderBy(result_df.similarity.desc())

        return ordered_result_df

# Usage
model_path = "models/alsmodel"
products_file = "products.csv"
item_rec = ItemRecommendation(model_path, products_file)
item_rec.prepare_data()
target_item_id = 5449 # Example target item ID
item_rec.calculate_similarities(target_item_id)
recommendations = item_rec.get_recommendations()
recommendations.show(truncate=False)
