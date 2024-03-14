# QuickPantry: Hassle-Free Grocery Shopping

## Overview

QuickPantry revolutionizes the online grocery shopping experience by leveraging recommendation systems and language understanding models. Our platform makes grocery shopping seamless, whether you're planning your weekly groceries or looking for ingredients for tonight's dinner.

## Features

- **User-Based Recommendations**: After logging in, users are greeted with personalized product recommendations based on their shopping history and preferences.
- **Item-Based Recommendations**: Discover products frequently bought together with our item-based recommendation feature. Each product comes with a "View" button, leading to a curated list of similar items.
- **Enhanced Search Capabilities**: Our search goes beyond the ordinary. Type in what you're looking for, be it a specific product or a meal plan like "ingredients for a sandwich," and our system will list all the necessary items for your culinary adventure.
- **Dynamic Content Loading**: Utilizing AJAX and Flask, our platform ensures a smooth browsing experience by dynamically loading search results and recommendations without page refreshes.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript (with AJAX for asynchronous requests)
- **Backend**: Python, Flask
- **Recommendation Engine**: Alternating Least Square(ALS) powered by PySpark and integrated via Apache Spark for scalability
- **Language Understanding**: OpenAI's GPT for interpreting natural language queries and providing relevant product suggestions

## Dataset
https://www.kaggle.com/competitions/instacart-market-basket-analysis

## Getting Started

1. **Prerequisites**: Ensure you have Python and Flask installed on your system.
2. **Installation**: Clone the repository and install the required Python packages using `pip install -r requirements.txt`.
3. **Running the Application**:
    - Create a .env file and add OPEN AI API organization ID and API key.
    - Start the Flask server by running `python main.py` from the terminal.
    - Open a browser and navigate to `http://127.0.0.1:5000` to access the QuickPantry platform.
5. **Usage**:
    - Log in with a user ID between 1 and 200,000 to see personalized recommendations.
    - Use the search bar for product searches or meal planning queries.
    - Explore item-based recommendations through the "View" button on each product.

## File Structure

- **Models:**
  - `alsmodel`: The directory or file for the machine learning model used in the project. Ensure to include this in your repository if necessary.

- **Static Files:**
  - `style.css`: The CSS stylesheet for styling the web application.
  - `script.js`: The JavaScript file to add interactivity to the web application.

- **HTML Templates:**
  - `index.html`: The main HTML template for the web application.
  - `login.html`: The HTML template for the login page. (Note: This file is mentioned but was not provided; ensure to create or include it.)

- **Notebooks:**
  - `Converting_Images.ipynb`: A Jupyter notebook for image conversion processes.
  - `Image_Scraper.ipynb`: A Jupyter notebook for scraping images.

- **Data:**
  - `products.csv`: The CSV file containing product data used in the project.

- **Source Files:**
  - `findsimilar.py`: Contains logic for finding similar products.
  - `OpenAI.py`: Interfaces with OpenAI API for recipe assistance.
  - `detect_questions.py`: Classifies user intent based on input queries.
  - `prediction.py`: Provides product recommendations using machine learning models.
  - `product_based.py`: Offers item recommendation features.
  - `main.py`: The Flask application's main file.

