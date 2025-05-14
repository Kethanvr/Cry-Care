import google.generativeai as genai

# Configure your API key
genai.configure(api_key="AIzaSyCQmJLP8uofA5ZmPJxLEcxW9X2ATZu-SCI")

# Fetch and print available models
models = genai.list_models()
for model in models:
    print(model.name)
