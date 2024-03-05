from flask import Flask, jsonify, request, render_template
import pandas as pd
from findsimilar import ProductSearch
import logging


app = Flask(__name__)

products_df = pd.read_csv("products.csv")
product_search = ProductSearch(products_df)
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

@app.route('/find_similar', methods=['POST'])
def find_similar():
    data = request.get_json()
    input_product_name = data['product_name']
    # Use the class method to find similar products
    similar_products_df = product_search.find_similar_products_cosine(input_product_name, top_n=20)
    logging.info(similar_products_df)
    x = jsonify(similar_products_df.to_dict('records'))
    logging.info(x)
    return x


if __name__ == '__main__':
    app.run(debug=True)
