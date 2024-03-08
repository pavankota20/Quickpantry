from pyspark.sql import SparkSession
from pyspark.ml.recommendation import ALSModel
from pyspark.sql.functions import explode, col


spark = SparkSession.builder.appName("RecommendationExample").getOrCreate()
products_df = spark.read.csv("products.csv", header=True, inferSchema=True)

model_path = "models/alsmodel"  
model = ALSModel.load(model_path)


user_id = 1
users = spark.createDataFrame([(user_id,)], ["user_id"])


N = 10
recommendations = model.recommendForUserSubset(users, N)

exploded_recommendations = recommendations.select(
    recommendations.user_id,
    explode(recommendations.recommendations).alias("recommendation")
).select(
    "user_id",
    col("recommendation.product_id").alias("product_id"),
    col("recommendation.rating")
)

products_df = products_df.withColumn("product_id", col("product_id").cast("integer"))

final_recommendations = exploded_recommendations.join(products_df, "product_id").select(
    "user_id", "product_name", "rating"
)


final_recommendations.show(truncate=False)

