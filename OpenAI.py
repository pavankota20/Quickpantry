from openai import OpenAI

client = OpenAI(
  organization='org-60tiN0w9MS38ybOTDKLBQJt3',
  api_key= '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'
)


user_input="i am looking to bake a chocolate cookie"
content = ''' Craft a list of essential ingredients necessary for preparing a chosen recipe. Please format your response by listing each component distinctly. The list should encompass all foundational items necessary for the recipe, avoiding any superfluous commentary or symbols. Your enumeration should follow this format:

Ingredient 1
Ingredient 2
Ingredient 3
Ensure the list is comprehensive, covering the variety of ingredients that blend together to create the full experience of the chosen dish.'''

messages =  [  
{'role':'system', 
 'content':content},    
{'role':'user', 
 'content': user_input},  
] 

stream = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    stream=True,
)
total = ""
for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        a=chunk.choices[0].delta.content
        total = total + a

print(total)