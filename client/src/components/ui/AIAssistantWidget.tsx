import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hi! I'm the FixNow AI Assistant. Describe your home issue, and I'll find the right service for you." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedServices, setRecommendedServices] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, recommendedServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setRecommendedServices([]);

    try {
      const response = await axios.post('/api/ai/chat', {
        message: userMessage,
        history: messages.slice(1)
      });

      setMessages(prev => [...prev, { role: 'model', content: response.data.data.reply }]);
      
      if (response.data.data.services && response.data.data.services.length > 0) {
        setRecommendedServices(response.data.data.services);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center hover:scale-105 transition-transform z-50 focus:outline-none"
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageSquareText size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-[#0f1117] rounded-3xl shadow-2xl border border-white/10 flex flex-col z-50 overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">FixNow AI Assistant</h3>
                <p className="text-xs text-amber-500 font-medium">Powered by Groq</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent relative hide-scrollbar">
              {/* Background Glows */}
              <div className="absolute top-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none" />
              <div className="absolute bottom-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-[50px] pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'user' ? 'bg-white/5 border border-white/10 text-white/50' : 'bg-amber-500/20 text-amber-500'
                    }`}>
                      {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                    </div>
                    <div className={`max-w-[75%] p-3.5 text-sm rounded-2xl leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-amber-500 text-white rounded-tr-none shadow-amber-500/20' 
                        : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {/* Recommended Services Chips */}
                {recommendedServices.length > 0 && (
                  <div className="flex flex-wrap gap-2 pl-10">
                    {recommendedServices.map(service => (
                      <Link 
                        key={service._id} 
                        to={`/services/${service.slug}`}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-4 py-2 rounded-full hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all shadow-sm"
                      >
                        Book {service.name} →
                      </Link>
                    ))}
                  </div>
                )}

                {isLoading && (
                  <div className="flex gap-2 flex-row">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Sparkles size={14} />
                    </div>
                    <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl rounded-tl-none flex items-center gap-2 text-white/50">
                      <Loader2 size={16} className="animate-spin text-amber-500" />
                      <span className="text-xs font-medium">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="E.g. My AC is making a loud noise..."
                  className="w-full bg-white/5 text-white text-sm rounded-full pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-amber-500/50 border border-white/10 transition-all placeholder:text-white/30"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-amber-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Send size={15} className="ml-0.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
