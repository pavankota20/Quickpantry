from flask import Flask, jsonify, request, render_template
import pandas as pd

app = Flask(__name__)

products_df = pd.read_csv("products.csv")

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

if __name__ == '__main__':
    app.run(debug=True)
