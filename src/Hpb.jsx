import { useState } from 'react';
import FormattedResponse from './components/FormattedResponse';

export default function Hpb() {
  const [messages, setMessages] = useState([
    {
      fromBot: true,
      text: "Olá! Sou seu assistente para diagnóstico e tratamento de lesões com oxigenoterapia hiperbárica. No que posso ajudar?",
    },
  ]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [disclaimerShown, setDisclaimerShown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() && !imageFile) return;

    const userMessage = {
      fromBot: false,
      text: input,
      image: imageFile ? URL.createObjectURL(imageFile) : null,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      let finalBotMessage = null;

      if (imageFile) {
        const body = new FormData();
        body.append('images', imageFile);

        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body,
        });

        const data = await response.json();
        finalBotMessage = data.message;

        setMessages(prev => [
          ...prev,
          {
            fromBot: true,
            text: disclaimerShown
              ? finalBotMessage
              : `${finalBotMessage}\n\n⚠️ Esta informação é geral e não substitui o aconselhamento médico profissional. Sempre consulte um médico.`,
          },
        ]);

        setDisclaimerShown(true);
      }

      if (input.trim()) {
        const body = { message: input };

        const response = await fetch('http://localhost:3000/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data = await response.json();

        const messageText = data.message;
        const formattedText = messageText.split('⚠️')[0].trim();
        const disclaimer =
          "\n\n⚠️ Esta informação é geral e não substitui o aconselhamento médico profissional. Sempre consulte um médico.";

        setMessages(prev => [
          ...prev,
          {
            fromBot: true,
            text: disclaimerShown ? formattedText : `${formattedText}${disclaimer}`,
          },
        ]);

        setDisclaimerShown(true);
      }
    } catch (err) {
      console.error('❌ Failed to get reply:', err);
      setMessages(prev => [...prev, { fromBot: true, text: 'Erro ao responder. Tente novamente.' }]);
    }

    setImageFile(null);
    setIsTyping(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen py-8 px-4 font-['Roboto']">
      <header className="text-center mb-6">
        <h1 className="text-4xl font-bold">Dr. IA Hiperbárica</h1>
        <p className="text-blue-300 text-sm">Online - Especialista em Medicina Hiperbárica</p>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinical Form */}
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

        {/* Chat Interface */}
        <section className="bg-gray-800 rounded-xl shadow-lg flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.fromBot ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {msg.fromBot ? '🤖' : '🧑'}
                </div>
                <div className="max-w-md space-y-2">
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="max-w-xs rounded-lg" />
                  )}
                  {msg.fromBot ? (
                    <FormattedResponse
                      response={msg.text}
                      showDisclaimer={index === messages.findIndex(m => m.fromBot)}
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-green-700 text-white">
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">🤖</div>
                <div className="p-3 rounded-lg bg-blue-700 text-white animate-pulse">Digitando...</div>
              </div>
            )}
          </div>

          {/* Input Section */}
          <div className="p-4 border-t border-gray-700 flex space-x-2">
            <input type="file" id="imageInput" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button
              onClick={() => document.getElementById('imageInput').click()}
              className={`px-4 py-2 rounded-full text-white ${imageFile ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {imageFile ? '✅ Imagem' : 'Imagem'}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua pergunta..."
              className="flex-1 px-4 py-3 border border-gray-600 rounded-full bg-gray-800 text-white placeholder-gray-400"
            />
            <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full">➤</button>
          </div>

          {/* Action Buttons */}
          <div className="p-4 flex justify-between">
            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Resetar Chat</button>
            <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">Exportar .txt</button>
          </div>
        </section>
      </main>
    </div>
  );
}
