from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.chains import RetrievalQA
from langchain_community.chat_models import ChatOpenAI
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()
assert os.getenv("OPENAI_API_KEY"), "❌ OPENAI_API_KEY is missing!"


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

    llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    streaming=True,
    openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vectorstore.as_retriever(search_kwargs={"k": 3}),
        return_source_documents=False,
        chain_type="stuff",
    )

    def generate():
        for token in qa_chain.stream(question):
            if isinstance(token, dict):
                yield token.get('content') or token.get('result', '')
            elif isinstance(token, str):
                yield token
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)