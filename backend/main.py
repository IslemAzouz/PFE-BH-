from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import base64
import os
from groq import Groq

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key à stocker en .env pour production
GROQ_API_KEY = "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"
os.environ["GROQ_API_KEY"] = GROQ_API_KEY

# Client Groq
client = Groq()

@app.post("/verify-documents")
async def verify_documents(files: list[UploadFile] = File(...)):
    results = []

    for file in files:
        # Lire le contenu du fichier
        contents = await file.read()
        base64_file = base64.b64encode(contents).decode("utf-8")

        # Format MIME en fonction de l'extension
        extension = file.filename.split(".")[-1].lower()
        mime_type = "image/jpeg" if extension in ["jpg", "jpeg"] else \
                    "image/png" if extension == "png" else \
                    "application/pdf"

        # Appel à l'API Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Verify if this document appears to be an official document such as an identity card, bank statement, income proof, or official registration. Respond only with Yes or No.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_file}",
                            },
                        },
                    ],
                }
            ],
            model="meta-llama/llama-4-maverick-17b-128e-instruct",
        )

        result = chat_completion.choices[0].message.content.strip()
        results.append({"filename": file.filename, "result": result})

    return {"verification_results": results}
