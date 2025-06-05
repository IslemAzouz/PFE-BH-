import os
import json
import numpy as np
import faiss
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from groq import Groq

# Initialisation FastAPI
app = FastAPI()

# CORS pour connexion avec le frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Remplace * par l’URL de ton front en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialisation Groq
GROQ_API_KEY = "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"
os.environ["GROQ_API_KEY"] = GROQ_API_KEY
client = Groq(api_key=GROQ_API_KEY)

# Charger les données QA
with open("qa.json", "r", encoding="utf-8") as f:
    qa_data = json.load(f)

# TF-IDF + FAISS
vectorizer = TfidfVectorizer()
questions = [item["question"] for item in qa_data]
tfidf_matrix = vectorizer.fit_transform(questions)
question_vectors = tfidf_matrix.toarray().astype(np.float32)

index = faiss.IndexFlatL2(question_vectors.shape[1])
index.add(question_vectors)

# Fonction de recherche avec FAISS
def retrieve_answer(user_query: str) -> str:
    query_vec = vectorizer.transform([user_query]).toarray().astype(np.float32)
    _, indices = index.search(query_vec, 1)
    return qa_data[indices[0][0]]["answer"]

# Modèle de requête
class QuestionRequest(BaseModel):
    question: str

# Endpoint principal
@app.post("/ask")
def ask_question(payload: QuestionRequest):
    try:
        user_query = payload.question
        relevant_answer = retrieve_answer(user_query)

        template = f"""
        Tu es un chatbot de BH Bank. Tu t'appelles BH bot et tu dois répondre en français.
        Question de l'utilisateur : {user_query}
        Réponse suggérée : {relevant_answer}
        Réponds uniquement à la question en restant professionnel et concis.
        si la question est en arabe repond en arabe sinon en fraçais
        
        """

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "user", "content": user_query},
                {"role": "system", "content": template},
            ],
            model="gemma2-9b-it"
        )

        response = chat_completion.choices[0].message.content
        return {"answer": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
