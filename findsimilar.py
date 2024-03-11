#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Mar  4 19:54:53 2024

@author: pavankumarkotapally
"""
import numpy as np
import pandas as pd
from fuzzywuzzy import process
from rapidfuzz import process, fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ProductSearch:
    def __init__(self, dataframe):
        self.dataframe = dataframe
      
        # Initialize the TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer()
        # Fit the vectorizer on the product names
        self.tfidf_matrix = self.vectorizer.fit_transform(self.dataframe['product_name'])
    
    def find_similar_products(self, input_product_name, top_n=10):
        # Assuming 'product_names' is a list of product names extracted from the dataframe
        product_names = self.dataframe['product_name'].tolist()
        results = process.extract(input_product_name, product_names, limit=top_n)
        # Convert results to DataFrame for nicer output
        similar_products_df = pd.DataFrame(results, columns=['Product Name', 'Similarity Score'])
        return similar_products_df
    
    
    def find_similar_products_rapid(self, input_product_name, top_n=10):
        product_names = self.dataframe['product_name'].tolist()
        # Using rapidfuzz to find matches
        results = process.extract(input_product_name, product_names, scorer=fuzz.WRatio, limit=top_n)
        # Creating a DataFrame from the results
        similar_products = [(result[0], result[1]) for result in results]
        similar_products_df = pd.DataFrame(similar_products, columns=['Product Name', 'Similarity Score'])
        return similar_products_df

    def find_similar_products_cosine(self, input_product_name, top_n=20, similarity_threshold=0.5):
   
        input_vec = self.vectorizer.transform([input_product_name])
        
        cos_similarities = cosine_similarity(input_vec, self.tfidf_matrix).flatten()
    
        eligible_indices = np.where(cos_similarities >= similarity_threshold)[0]
        
        filtered_scores = cos_similarities[eligible_indices]
        
        sorted_filtered_indices = eligible_indices[filtered_scores.argsort()][-top_n:][::-1]
        
        
        similar_products = self.dataframe.iloc[sorted_filtered_indices]
        return similar_products