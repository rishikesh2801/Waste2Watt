import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Sparkles } from 'lucide-react';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! I am the Waste2Watt AI Assistant by Municipal Corporation Roorkee. 🌱\n\nHow can I help you today? You can ask me how to register a complaint, track status, or learn about our IoT smart bins.' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('register') || lowerText.includes('complain') || lowerText.includes('report')) {
      return "To register a grievance:\n1. Click 'Register Grievance' on the top menu.\n2. Provide your Name, Mobile, and exact Roorkee location.\n3. Upload a live photo of the waste.\n4. Complete OTP verification.\n\nYou'll receive a Tracking ID (like C-123456) via Email!";
    }
    
    if (lowerText.includes('track') || lowerText.includes('status')) {
      return "To track your complaint:\n1. Click 'Track Status' on the home page.\n2. Enter your unique Tracking ID (e.g., C-123456).\n3. Complete the captcha to view real-time live status and see which worker is assigned.";
    }

    if (lowerText.includes('iot') || lowerText.includes('smart bin') || lowerText.includes('dustbin')) {
      return "Waste2Watt uses IoT-enabled smart bins across Roorkee! 🚀\nThese bins automatically monitor their fill levels and battery life. When a bin is nearly full (above 90%), our system automatically dispatches a Waste Collector to empty it before it overflows.";
    }

    if (lowerText.includes('flow') || lowerText.includes('process') || lowerText.includes('step')) {
       return "Here is the Waste2Watt flow:\n1️⃣ You submit an issue with a photo & location.\n2️⃣ A Serviceman assigns it to a Waste Collector.\n3️⃣ The worker clears the waste and uploads a live completion photo.\n4️⃣ You receive a 'Resolution' confirmation email! 🎉";
    }

    if (lowerText.includes('toll') || lowerText.includes('call') || lowerText.includes('number') || lowerText.includes('phone') || lowerText.includes('contact')) {
       return "You can call the Municipal Corporation Roorkee 24/7 Helpline at 1800-123-4567 for immediate assistance.";
    }

    if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) {
       return "Hello! Welcome to Waste2Watt. How can I assist you with keeping Roorkee clean today?";
    }

    return "I'm sorry, I didn't quite catch that. You can ask me about how to register a complaint, how to track it, our IoT bins, or our toll-free number. I'm here to guide you!";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), type: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI thinking
    setTimeout(() => {
      const botResponse = {
         id: Date.now() + 1,
         type: 'bot',
         text: generateResponse(userMessage.text)
      };
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-white shadow-2xl hover:scale-110 transition-transform z-[9999] flex items-center justify-center border-2 border-green-600 overflow-visible group ${isOpen ? 'hidden' : 'flex'}`}
        style={{ boxShadow: '0 10px 30px -5px rgba(22, 163, 74, 0.6)', position: 'fixed', bottom: '24px', right: '24px' }}
      >
        <img src="/logo.jpg" alt="AI Assistant" className="w-full h-full object-cover rounded-full z-10" />
        
        {/* Interactive glowing rings */}
        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75 pointer-events-none"></div>
        <div className="absolute -inset-1 rounded-full bg-green-500 opacity-20 animate-pulse pointer-events-none"></div>
        
        {/* Notification Dot */}
        <div className="absolute 0 top-0 right-0 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-bounce z-20 shadow-sm"></div>
        
        {/* Hover Tooltip */}
        <span className="absolute right-[80px] bg-[#1a3a6b] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none scale-95 group-hover:scale-100 duration-200">
          Ask Waste2Watt AI 👋
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-[#1a3a6b] rotate-45"></div>
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col overflow-hidden border border-slate-200 animate-fade-in"
          style={{ position: 'fixed', bottom: '24px', right: '24px' }}
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a3a6b] to-blue-800 p-4 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-green-500 shadow-sm">
                <img src="/logo.jpg" alt="Waste2Watt" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-wide">Waste<span className="text-orange-500">2</span>Watt AI</h3>
                <p className="text-[10px] text-green-300 uppercase tracking-widest font-bold">Online</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-[85%] gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {msg.type === 'user' ? (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-slate-200 text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 bg-white overflow-hidden border border-gray-200 shadow-sm p-0.5">
                      <img src="/logo.jpg" alt="AI" className="w-full h-full object-cover rounded-full" />
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl text-sm whitespace-pre-line shadow-sm ${
                    msg.type === 'user' 
                    ? 'bg-[#1a3a6b] text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>

                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-slate-100 rounded-full outline-none text-sm text-slate-700 border border-slate-200 focus:border-green-600 focus:bg-white transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors shadow-md"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
