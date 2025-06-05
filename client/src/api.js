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

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let done = false;
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunk = decoder.decode(value);
    onToken(chunk);
  }
};
