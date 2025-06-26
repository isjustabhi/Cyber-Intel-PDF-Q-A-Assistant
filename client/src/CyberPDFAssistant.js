import React, { useState } from 'react';
import { UploadCloud, SendHorizonal, Loader2, Download, Sun, Moon, User, Shield, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './CyberPDFApp.css';
import jsPDF from 'jspdf';

const suggestedQuestions = [
  "What is the purpose of this CWE vulnerability theory document?",
  "Who authored the document?",
  "What is a control sphere according to the PDF?.",
  "What is the goal of MITRE’s vulnerability theory framework?",
  "What are the main components of the CARD model (Channels, Actors, Roles, Directives)?"
];

export default function CyberPDFApp() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('pdf', file);

    const uploadRes = await fetch('http://127.0.0.1:5000/upload', {
      method: 'POST',
      body: formData,
    });

    if (uploadRes.ok) alert('✅ PDF uploaded successfully!');
  };

  const handleAsk = async () => {
    setLoading(true);
    const res = await fetch('http://127.0.0.1:5000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setChatHistory([...chatHistory, { question, answer: data.answer }]);
    setQuestion('');
    setLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 10;
    chatHistory.forEach((chat, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`Q${index + 1}: ${chat.question}`, 10, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(`A${index + 1}: ${chat.answer}`, 180);
      doc.text(lines, 10, y);
      y += lines.length * 10 + 5;
    });
    doc.save('chat_history.pdf');
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <div className="app-card">
        <div className="app-header">
          <h1 className="app-title">🧠 Cyber Intel Q&A Assistant</h1>
          <div className="description-box">This assistant is part of a cybersecurity research project focused on CVE (Common Vulnerabilities and Exposures) and CWE (Common Weakness Enumeration). It uses RAG (Retrieval-Augmented Generation) to answer questions based on uploaded PDFs, particularly those related to vulnerability types, mitigation strategies, and threat taxonomies.</div>
          <div className="app-toolbar">
            <button onClick={toggleDarkMode} className="toolbar-button">
              {darkMode ? <Sun /> : <Moon />} {darkMode ? 'Light' : 'Dark'} Mode
            </button>
            <button onClick={exportToPDF} className="toolbar-button">
              <Download /> Export Chat
            </button>
          </div>
        </div>

        <div className="suggested-box">
          <Sparkles size={16} /> <span>Suggested questions:</span>
          <div className="suggested-list">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                className="suggested-question"
                onClick={() => setQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="app-form">
          <div className="app-upload">
            <label className="upload-label">
              <UploadCloud className="upload-icon" />
              <input type="file" className="upload-input" onChange={handleFileChange} />
              <span className="upload-text">{file ? file.name : 'Click or drag a PDF here to upload'}</span>
            </label>
            <button onClick={handleUpload} className="upload-button">
              Upload PDF
            </button>
          </div>

          <div className="app-question">
            <input
              type="text"
              placeholder="💬 Ask a question about the uploaded PDF..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="question-input"
            />
          </div>

          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="ask-button"
          >
            {loading ? <Loader2 className="loader" /> : <SendHorizonal className="send-icon" />} Ask
          </button>

          <div className="chat-container">
            {chatHistory.map((chat, index) => (
              <div key={index} className="chat-bubble-wrapper">
                <div className="chat-question chat-question-bg">
                  <div className="avatar"><User size={18} /></div>
                  <div><strong>User:</strong> {chat.question}</div>
                </div>
                <div className="chat-answer chat-answer-bg">
                  <div className="avatar"><Shield size={18} /></div>
                  <div><ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.answer}</ReactMarkdown></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
