from openai import OpenAI

class RecipeAssistant:
    def __init__(self, organization, api_key):
        self.client = OpenAI(organization=organization, api_key=api_key)

    def get_ingredient_list(self, user_input):
        content = '''Craft a list of essential ingredients necessary for preparing a chosen recipe. Please format your response by listing each component distinctly. The list should encompass all foundational items necessary for the recipe, avoiding any superfluous commentary or symbols. Your enumeration should follow this format:

                        Ingredient 1
                        Ingredient 2
                        Ingredient 3
                        
                        Ensure the list is comprehensive without any bullet points, covering the variety of ingredients that blend together to create the full experience of the chosen dish.'''
        
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

    recipe_assistant = RecipeAssistant(organization=organization_id, api_key=api_key)

    user_input = "ic"
    ingredient_list = recipe_assistant.get_ingredient_list(user_input)
    print(ingredient_list)
