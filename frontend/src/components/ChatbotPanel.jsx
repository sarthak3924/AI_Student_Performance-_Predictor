import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, MessageSquare, CornerDownLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatbotPanel() {
  const [messages, setMessages] = useState([
    {
      sender: 'counselor',
      text: 'Welcome! I am your AI Academic Counselor. Ask me about your prediction status, how you can improve your grade, class attendance levels, or general study strategies.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input;
    setInput('');
    setSending(true);

    const timeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { sender: 'student', text: userText, time: timeStamp }]);

    try {
      const response = await axios.post('/api/v1/student/chatbot', { query: userText });
      const reply = response.data?.response;

      setMessages((prev) => [
        ...prev,
        { sender: 'counselor', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'counselor', text: 'Sorry, I am having trouble connecting to my cognitive networks. Please try again.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card flex flex-col h-[520px] rounded-2xl overflow-hidden relative shadow-glass-dark">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 p-4 border-b border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Sparkles className="h-5 w-5 pulse-glow" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              AI Academic Counselor
            </h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Advisor Agent Active
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, idx) => {
          const isStudent = m.sender === 'student';
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  isStudent
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/80 dark:bg-slate-800/60 text-slate-200 border border-slate-700/50 rounded-bl-none'
                }`}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: m.text }} 
                  className="space-y-1"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
            </motion.div>
          );
        })}
        {sending && (
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />
            <span>AI advisor is compiling report parameters...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-700/30 bg-slate-900/40">
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-700/40 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message (e.g. How can I raise my grade?)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none w-full"
            disabled={sending}
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            disabled={!input.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-between items-center px-1 mt-1.5">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <CornerDownLeft className="h-2.5 w-2.5" /> press enter to send
          </span>
          <span className="text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20 font-medium">
            Rule-Based NLP Engine
          </span>
        </div>
      </form>
    </div>
  );
}
