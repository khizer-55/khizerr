import { useState } from 'react';

export default function Hpb() {
  const [messages, setMessages] = useState([
    {
      fromBot: true,
      text: "Olá! Sou seu assistente para diagnóstico e tratamento de lesões com oxigenoterapia hiperbárica. No que posso ajudar?",
    },
  ]);
  const [input, setInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  // ✅ Updated: Sends text to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { fromBot: false, text: userMessage }]);
    setInput('');

    try {
      const response = await fetch('http://localhost:3000/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      console.log("✅ GPT Text Reply:", data);
      setMessages((prev) => [...prev, { fromBot: true, text: data.message }]);
    } catch (err) {
      console.error('❌ Failed to get text reply:', err);
      setMessages((prev) => [...prev, { fromBot: true, text: 'Erro ao responder. Tente novamente.' }]);
    }
  };

  // ✅ Already working: Send image to backend
 const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const imageUrl = URL.createObjectURL(file);

    // Add uploaded image to messages
    setMessages((prev) => [...prev, { fromBot: false, image: imageUrl }]);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("✅ GPT response from backend:", data);

      setMessages((prev) => [...prev, { fromBot: true, text: data.message }]);
    } catch (err) {
      console.error('Failed to fetch GPT response:', err);
      setMessages((prev) => [...prev, { fromBot: true, text: 'Erro ao analisar a imagem. Tente novamente.' }]);
    }
  }
};


  return (
    <div className="bg-gray-900 text-white min-h-screen py-8 px-4 font-['Roboto']">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold">Dr. IA Hiperbárica</h1>
        <p className="text-blue-300 text-sm">Online - Especialista em Medicina Hiperbárica</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulário */}
        <section className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Formulário Clínico</h2>
          <form className="space-y-4">
            <input type="text" placeholder="Nome do paciente" className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600" required />
            <input type="number" placeholder="Idade" className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600" required />
            <input type="text" placeholder="Local da lesão" className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600" required />
            <textarea placeholder="Sintomas, evolução, comorbidades..." className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600" required />
            <button type="submit" className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded w-full">Exportar Formulário (.txt)</button>
          </form>
        </section>

        {/* Chat section */}
        <section className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.fromBot ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {msg.fromBot ? '🤖' : '🧑'}
                </div>
                <div className={`p-3 max-w-md rounded-lg ${msg.fromBot ? 'bg-blue-900' : 'bg-green-700'}`}>
                  {msg.text && <p>{msg.text}</p>}
{msg.image && (
  <img src={msg.image} alt="Uploaded" className="max-w-xs rounded-lg mt-2" />
)}

                </div>
              </div>
            ))}
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="upload-preview rounded-lg mt-2" />
            )}
          </div>

          {/* Input field */}
          <div className="p-4 border-t border-gray-700 flex space-x-2">
            <input type="file" id="imageInput" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button onClick={() => document.getElementById('imageInput').click()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full">Imagem</button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 px-4 py-3 border border-gray-600 rounded-full bg-gray-800 text-white placeholder-gray-400"
            />
            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full">➤</button>
          </div>

          <div className="p-4 flex justify-between">
            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Resetar Chat</button>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">Exportar .txt</button>
          </div>
        </section>
      </main>
    </div>
  );
}
