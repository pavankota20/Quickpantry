from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALSModel
from pyspark.sql.functions import explode, col
import logging

import numpy as np
from pyspark.sql.functions import udf, col
from pyspark.sql.types import ArrayType, FloatType
from pyspark.ml.linalg import Vectors, VectorUDT

logging.basicConfig(level = logging.INFO)

class ProductRecommender:
    def __init__(self, model_path, products_csv_path):
        self.spark = SparkSession.builder.appName("RecommendationExample").getOrCreate()
        self.model = ALSModel.load(model_path)
        self.products_df = self.spark.read.csv(products_csv_path, header=True, inferSchema=True).withColumn("product_id", col("product_id").cast("integer"))

    def get_recommendations(self, user_id, n=10):
        users = self.spark.createDataFrame([(user_id,)], ["user_id"])
        recommendations = self.model.recommendForUserSubset(users, n)
        exploded_recommendations = recommendations.select(
            recommendations.user_id,
            explode(recommendations.recommendations).alias("recommendation")
        ).select(
            "user_id",
            col("recommendation.product_id").alias("product_id"),
            col("recommendation.rating")
        )
        final_recommendations = exploded_recommendations.join(self.products_df, "product_id").select(
            "user_id", "product_id", "product_name", "rating"
        )

        return final_recommendations.toPandas()


