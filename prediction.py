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

        return final_recommendations.toPandas()
    
    
#     def cosine_similarity(a, b):
#         return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    
#     def get_recommendations_product(self, product_id, n=10):
#         # Generate recommendations for the user
#         # items = self.spark.createDataFrame([(product_id,)], ["product_id"])
#         # recommendations = self.model.recommendForItemSubset(items, n)

#         # Explode recommendations to separate rows
#         item_factors = self.model.itemFactors
#         cosine_similarity_udf = udf(cosine_similarity, FloatType())
        
#         item_factors_broadcast = self.spark.sparkContext.broadcast(
#             {row['id']: row['features'] for row in item_factors.collect()}
#         )
        
#         @udf(ArrayType(FloatType()))
#         def item_similarities(item_id):
#             target_features = np.array(item_factors_broadcast.value[item_id])
#             return [
#                 cosine_similarity(target_features, np.array(features)) 
#                 for _, features in item_factors_broadcast.value.items()
#             ]
        
#         # Add a new column with the similarities
#         item_factors = item_factors.withColumn("similarities", item_similarities(col("id")))

#         return item_factors
    
    
    
    

#     # UDF to calculate cosine similarity between two vectors
    
    
#     # Define a UDF to calculate similarities with all items
    

    
    
# model_path = "models/alsmodel"
# products_csv_path = "products.csv"
# recommender = ProductRecommender(model_path, products_csv_path)
# x = recommender.get_recommendations_product(1, n=10)
# x.show()



