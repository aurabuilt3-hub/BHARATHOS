import os
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

class TestSchema(BaseModel):
    status: str
    message: str

try:
    print("Initializing ChatGoogleGenerativeAI...")
    api_key = os.getenv("GEMINI_API_KEY", "mock_key")
    
    # Initialize the model with gemini-3.6-flash
    model = ChatGoogleGenerativeAI(
        model="gemini-3.6-flash",
        google_api_key=api_key,
        timeout=5.0
    )
    
    # Try using structured output
    structured_model = model.with_structured_output(TestSchema)
    
    print("Sending connection test query...")
    response = structured_model.invoke("Say connection successful with status OK.")
    print("Received response:")
    print(response)
except Exception as e:
    print(f"Error during query execution: {type(e).__name__}: {str(e)}")
