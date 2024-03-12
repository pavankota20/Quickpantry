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
from pyspark.sql.functions import row_number, col
from pyspark.sql.window import Window

class ItemRecommendation:
    def __init__(self, model_path, products_file):
        self.spark = SparkSession.builder \
            .appName("Item Similarity and Recommendation") \
            .getOrCreate()
        self.model = ALSModel.load(model_path)
        self.product_df = self.spark.read.csv(products_file, header=True, inferSchema=True)
        self.itemFactors = self.model.itemFactors
        self.broadcast_item_factors = None

    
    @staticmethod
    @udf(FloatType())
    def cosine_similarity(v1, v2):
        v1 = np.array(v1)
        v2 = np.array(v2)
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

    def prepare_data(self):
       
        item_factors = self.itemFactors.rdd.map(lambda x: (x['id'], x['features'])).collectAsMap()

       
        self.broadcast_item_factors = self.spark.sparkContext.broadcast(item_factors)

    def calculate_similarities(self, target_item_id):
        target_factors = Vectors.dense(self.broadcast_item_factors.value[target_item_id])

       
        self.itemFactors = self.itemFactors.withColumn("target_factors", array([lit(x) for x in target_factors]))

       
        self.itemFactors = self.itemFactors.withColumn("similarity", self.cosine_similarity(col("features"), col("target_factors")))

    def get_recommendations(self):
    # Assuming combined_df is already defined and correct
        combined_df = self.product_df.join(self.itemFactors, self.product_df.product_id == self.itemFactors.id)
        result_df = combined_df.select("product_id", "product_name", "similarity")
    
        # Order by similarity in descending order
        ordered_result_df = result_df.orderBy(result_df.similarity.desc())
    
        # Define a window specification without partitionBy, if you're ordering entire DataFrame
        windowSpec = Window.orderBy(ordered_result_df.similarity.desc())
    
        # Apply the window spec to add row numbers
        ordered_result_df = ordered_result_df.withColumn('row_number', row_number().over(windowSpec))
    
        # Filter to get rows from 2 to 11, which skips the top 1 and gets the next 10
        filtered_df = ordered_result_df.filter((col("row_number") > 1) & (col("row_number") <= 11))
    
        # Drop the row_number column if you no longer need it
        final_df = filtered_df.drop("row_number")
    
        return final_df.toPandas()

# Usage
# model_path = "models/alsmodel"
# products_file = "products.csv"
# item_rec = ItemRecommendation(model_path, products_file)
# item_rec.prepare_data()
# target_item_id = 5449 # Example target item ID
# item_rec.calculate_similarities(target_item_id)
# recommendations = item_rec.get_recommendations()
# recommendations.show(truncate=False)
