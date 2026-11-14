import os
import google.generativeai as genai

# Configure your API key
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY must be set in the server environment")
genai.configure(api_key=api_key)

# Fetch and print available models
models = genai.list_models()
for model in models:
    print(model.name)
