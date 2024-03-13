from flask import Flask, jsonify, request, render_template
import pandas as pd
from findsimilar import ProductSearch
from OpenAI import RecipeAssistant
from detect_questions import IntentClassifier
from prediction import ProductRecommender
from product_based import ItemRecommendation
import logging
import os
from PIL import Image


app = Flask(__name__)
logged_in_user = 0
products_df = pd.read_csv("products.csv")
organization_id = 'org-60tiN0w9MS38ybOTDKLBQJt3'
api_key = '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'
model_path = "models/alsmodel"
products_csv_path = "products.csv"
itemRecommender = ItemRecommendation(model_path, products_csv_path)
recommender = ProductRecommender(model_path, products_csv_path)
product_search = ProductSearch(products_df)
recipe_assistant = RecipeAssistant(organization_id, api_key)
intent_classifier = IntentClassifier(organization_id, api_key)
logging.basicConfig(level = logging.INFO)

@app.route('/', methods=['GET'])
def login():
    return render_template('login.html')

@app.route('/main', methods=['POST'])
def main():
    logged_in_user = request.form['email']
    return render_template('index.html', logged_in_user = logged_in_user)

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    try:
        search = request.args.get('term')
        matching_products = products_df[products_df['product_name'].str.contains(search, case=False, na=False)]['product_name'].tolist()
        return jsonify(matching_products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/initialRecommendations', methods=['POST'])
def initialRecommendations():
    data = request.get_json()
    logged_in_user = data['logged_in_user']
    recommendations_df = recommender.get_recommendations(int(logged_in_user), 10);
    logging.info(recommendations_df.head())
    x = jsonify(recommendations_df.to_dict('records'))
    return x

@app.route('/intent_classification', methods=['POST'])
def intent_classification():
    data = request.get_json()
    input_product_name = data['product_name']
    intent = intent_classifier.classify_intent(input_product_name)
    logging.info(intent)
    x = jsonify({'intent': intent})
    return x

@app.route('/get_recipe_ingredients', methods=['POST'])
def get_recipe_ingredients():
    data = request.get_json()
    input_product_name = data['product_name']
    ingredients = recipe_assistant.get_ingredient_list(input_product_name)
    ingredients = ingredients.split('\n')
    x = jsonify({'ingredients': ingredients})
    return x

@app.route('/find_similar', methods=['POST'])
def find_similar():
    data = request.get_json()
    input_product_name = data['product_name']
    similar_products_df = product_search.find_similar_products_cosine(input_product_name, top_n=20)
    x = jsonify(similar_products_df.to_dict('records'))
    return x

@app.route('/find_image_formats', methods=['GET'])
def find_image_formats():
    product_id = request.args.get('term')
    directory = 'static/Images/' + str(product_id) + '/';
    for entry in os.listdir(directory):
        path = os.path.join(directory, entry)
        if os.path.isfile(path):
            try:
                with Image.open(path) as img:
                    return jsonify(img.format)
            except IOError:
                return jsonify('Not found')
            
@app.route('/get_product_recommendations', methods=['POST'])
def get_product_recommendations():
    data = request.get_json()
    target_item_id = data['product_id'];
    itemRecommender.prepare_data()
    itemRecommender.calculate_similarities(target_item_id)
    recommendations = itemRecommender.get_recommendations()
    logging.info(recommendations.head())
    x = jsonify(recommendations.to_dict('records'))
    return x


@app.route('/logout')
def logout():
    return render_template('login.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int("5000"), debug=True)
