from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALSModel
from pyspark.sql.functions import explode, col
import logging

logging.basicConfig(level = logging.INFO)

class ProductRecommender:
    def __init__(self, model_path, products_csv_path):
        self.spark = SparkSession.builder.appName("RecommendationExample").getOrCreate()
        self.model = ALSModel.load(model_path)
        self.products_df = self.spark.read.csv(products_csv_path, header=True, inferSchema=True).withColumn("product_id", col("product_id").cast("integer"))

    def get_recommendations(self, user_id, n=10):
        # Generate recommendations for the user
        users = self.spark.createDataFrame([(user_id,)], ["user_id"])
        recommendations = self.model.recommendForUserSubset(users, n)

        # Explode recommendations to separate rows
        exploded_recommendations = recommendations.select(
            recommendations.user_id,
            explode(recommendations.recommendations).alias("recommendation")
        ).select(
            "user_id",
            col("recommendation.product_id").alias("product_id"),
            col("recommendation.rating")
        )
            
        # Join with product names
        final_recommendations = exploded_recommendations.join(self.products_df, "product_id").select(
            "user_id", "product_id", "product_name", "rating"
        )
        
        # logging.info(final_recommendations.toPandas().head())

        return final_recommendations.toPandas()

# # Usage example
# model_path = "models/alsmodel"
# products_csv_path = "products.csv"
# recommender = ProductRecommender(model_path, products_csv_path)

# user_id = 1
# N = 10
# recommendations = recommender.get_recommendations(user_id, N)
# recommendations.head()
