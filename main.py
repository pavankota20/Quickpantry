from flask import Flask, jsonify, request, render_template
import pandas as pd
from findsimilar import ProductSearch
from OpenAI import RecipeAssistant
from detect_questions import IntentClassifier
import logging


app = Flask(__name__)

products_df = pd.read_csv("products.csv")
organization_id = 'org-60tiN0w9MS38ybOTDKLBQJt3'
api_key = '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'
product_search = ProductSearch(products_df)
recipe_assistant = RecipeAssistant(organization_id, api_key)
intent_classifier = IntentClassifier(organization_id, api_key)
logging.basicConfig(level = logging.INFO)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    try:
        search = request.args.get('term')
        matching_products = products_df[products_df['product_name'].str.contains(search, case=False, na=False)]['product_name'].tolist()
        return jsonify(matching_products)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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


if __name__ == '__main__':
    app.run(debug=True)
