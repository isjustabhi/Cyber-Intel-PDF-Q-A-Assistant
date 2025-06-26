export const uploadPDF = (formData) =>
  fetch('http://127.0.0.1:5000/upload', {
    method: 'POST',
    body: formData,
  }).then(res => res.json());

export const streamAnswer = async (question, onToken) => {
  const response = await fetch('http://127.0.0.1:5000/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });

  const { answer } = await response.json();
  onToken(answer); // Send entire response to callback
};