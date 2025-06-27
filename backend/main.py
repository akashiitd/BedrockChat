
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import boto3
import json
import base64
from pydantic import BaseModel
import PyPDF2
import io

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class ChatMessage(BaseModel):
    message: str
    history: list = []

# Use the correct model ID for Claude 3.5 Sonnet
inference_profile_id = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

@app.post("/api/chat")
async def chat(chat_message: ChatMessage):
    try:
        messages = chat_message.history + [{"role": "user", "content": chat_message.message}]
        
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 8192,
            "messages": messages
        }

        response = bedrock_runtime.invoke_model(
            body=json.dumps(body),
            modelId=inference_profile_id,
            accept='application/json',
            contentType='application/json'
        )

        response_body = json.loads(response.get('body').read())
        return {"response": response_body['content'][0]['text']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        encoded_image = base64.b64encode(image_bytes).decode('utf-8')
        
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 8192,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": file.content_type,
                                "data": encoded_image
                            }
                        },
                        {
                            "type": "text",
                            "text": "Describe this image."
                        }
                    ]
                }
            ]
        }

        response = bedrock_runtime.invoke_model(
            body=json.dumps(body),
            modelId=inference_profile_id,
            accept='application/json',
            contentType='application/json'
        )

        response_body = json.loads(response.get('body').read())
        return {"response": response_body['content'][0]['text']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-pdf")
async def analyze_pdf(file: UploadFile = File(...)):
    try:
        pdf_bytes = await file.read()
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 8192,
            "messages": [
                {
                    "role": "user",
                    "content": f"Summarize the following document:\n\n{text}"
                }
            ]
        }

        response = bedrock_runtime.invoke_model(
            body=json.dumps(body),
            modelId=inference_profile_id,
            accept='application/json',
            contentType='application/json'
        )

        response_body = json.loads(response.get('body').read())
        return {"response": response_body['content'][0]['text']}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
