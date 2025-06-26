from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv()
assert os.getenv("OPENAI_API_KEY"), "❌ OPENAI_API_KEY is missing!"
assert os.getenv("LLM_API_KEY"), "❌ LLM_API_KEY is missing!"
assert os.getenv("LLM_URL"), "❌ LLM_URL is missing!"

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

vectorstore = None

@app.route('/upload', methods=['POST'])
def upload_pdf():
    global vectorstore
    file = request.files['pdf']
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    loader = PyPDFLoader(path)
    docs = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    split_docs = splitter.split_documents(docs)

    embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
    vectorstore = FAISS.from_documents(split_docs, embeddings)

    return jsonify({'status': 'indexed', 'chunks': len(split_docs)})

@app.route('/ask', methods=['POST'])
def ask_question():
    global vectorstore
    data = request.get_json()
    question = data['question']

    docs = vectorstore.similarity_search(question, k=3)
    context = "\n\n".join([doc.page_content for doc in docs])

    prompt = f"""
You are a cybersecurity assistant with expertise in vulnerability analysis and mitigation.
Use the context from the uploaded PDF to answer the question accurately.
If the context does not contain the answer, clearly say "The answer is not available in the document."

Context:
{context}

Question:
{question}

Answer:
"""

    headers = {
        "Authorization": f"Bearer {os.getenv('LLM_API_KEY')}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "Meta-Llama-3.1-70B-Instruct-quantized",
        "messages": [
            {"role": "system", "content": "You are a cybersecurity assistant."},
            {"role": "user", "content": prompt}
        ],
        "stream": False
    }

    response = requests.post(os.getenv("LLM_URL") + "/chat/completions", headers=headers, json=payload)

    if response.status_code != 200:
        return jsonify({"error": response.json()}), 500

    answer = response.json()["choices"][0]["message"]["content"]
    return jsonify({"answer": answer})

if __name__ == '__main__':
    app.run(debug=True)
