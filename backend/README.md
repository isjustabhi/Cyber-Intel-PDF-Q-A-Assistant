# PDF Question Answering System (with LangChain, RAG & Streaming)

A full-stack app that allows users to upload a PDF and ask questions about its content. The backend uses LangChain + OpenAI for Retrieval-Augmented Generation (RAG) and streams answers to the React frontend.

## 🔧 Tech Stack

- **Frontend**: React.js
- **Backend**: Flask + LangChain + FAISS + OpenAI API
- **PDF Parsing**: PyPDF2 + LangChain's PyPDFLoader

---

## 🚀 Getting Started

### 📦 Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # (on Windows: venv\Scripts\activate)
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` folder:

```
OPENAI_API_KEY=your-openai-api-key
```

Then run:

```bash
python rag_pdf_qa.py
```

---

### 💻 Frontend

```bash
cd client
npm install
npm start
```

Frontend runs at: [http://localhost:3000](http://localhost:3000)

---

## ✅ Features

- Upload PDFs
- Ask natural language questions
- RAG with top relevant chunks
- Streams answer as it's generated
- Easily customizable and extendable

---

## 📁 Structure

```
pdf_qa_project/
├── backend/
│   ├── rag_pdf_qa.py
│   ├── requirements.txt
│   ├── .env (not included in Git)
│   └── uploads/
├── client/
│   ├── src/
│   │   ├── App.js
│   │   └── api.js
└── README.md
```

---

## 🧠 Credits

Built using:
- [LangChain](https://github.com/langchain-ai/langchain)
- [OpenAI GPT](https://platform.openai.com/)