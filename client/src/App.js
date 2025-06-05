import React, { useState } from 'react';
import { uploadPDF, streamAnswer } from './api';

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('pdf', file);
    await uploadPDF(formData);
    alert('PDF uploaded and indexed!');
  };

  const handleAsk = async () => {
    setAnswer('');
    setLoading(true);
    await streamAnswer(question, token => setAnswer(prev => prev + token));
    setLoading(false);
  };

  return (
    <div>
      <h2>PDF Question Answering</h2>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      <input
        type="text"
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask a question"
      />
      <button onClick={handleAsk}>Ask</button>

      <div>
        <h4>Answer:</h4>
        <p>{loading ? 'Loading...' : answer}</p>
      </div>
    </div>
  );
}

export default App;
