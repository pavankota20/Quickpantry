#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Tue Mar 5 14:30:41 2024

@author: pavankumarkotapally
"""

from openai import OpenAI

class IntentClassifier:
    def __init__(self, organization, api_key):
        self.client = OpenAI(organization=organization, api_key=api_key)

    def classify_intent(self, user_input):
        content = '''
        "Your role is to analyze the user input text to understand if the user's intention is to find ingredients for the purpose of shopping or if they are planning to cook or prepare a dish. You need to determine the context of the input: is it aimed at purchasing specific items (which we will refer to as 'shopping intent') or is it about preparing a meal (referred to as 'cooking intent').

        Respond with 'Ingredient' if the text indicates the user is looking to purchase specific items or ingredients without any immediate indication of preparing a dish. This includes lists of ingredients, inquiries about where to buy specific food items, or questions about product availability.
        Respond with 'Cooking' if the text suggests the user is interested in cooking, including searching for recipes, asking about how to prepare or cook dishes, or looking for ingredients with the purpose of using them in a recipe.
        Respond with 'Ingredient' if the user provides only the name of an ingredient without any additional context or mention of shopping or cooking.

        Examples for clarity:

        Input: 'Best price for olive oil' → Your response: 'Ingredient'
        Input: 'How to make spaghetti carbonara' → Your response: 'Cooking'
        Input: 'Ingredients needed for a pumpkin pie' → Your response: 'Cooking'
        Input: 'Where can I find fresh basil leaves?' → Your response: 'Ingredient'
        Input: 'Substitute for baking soda in cakes' → Your response: 'Cooking'
        Input: 'Quantity of rice for biryani for 4 people' → Your response: 'Cooking'
        Input: 'Looking for a good brand of vanilla extract' → Your response: 'Ingredient'
        Input: 'Steps to marinate chicken for grilling' → Your response: 'Cooking'
        Input: 'Is there a difference between white and brown eggs?' → Your response: 'Ingredient'
        Input: 'How long to boil eggs for hard-boiled eggs' → Your response: 'Cooking'
        Input: 'Tomatoes' → Your response: 'Ingredient'


        Your analysis should carefully consider the user's intention based on the content and context of their input, distinguishing between shopping for ingredients or items and the intention to use them in cooking or meal preparation." 
        '''

        messages = [
            {'role': 'system', 'content': content},
            {'role': 'user', 'content': user_input},
        ]

        stream = self.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            stream=True,
        )

        total = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                total += chunk.choices[0].delta.content

        return total

# Example usage:
if __name__ == "__main__":
    organization_id = 'org-60tiN0w9MS38ybOTDKLBQJt3'
    api_key = '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'

    classifier = IntentClassifier(organization=organization_id, api_key=api_key)

    user_input = input("type here: ")
    intent = classifier.classify_intent(user_input)
    print(intent)
