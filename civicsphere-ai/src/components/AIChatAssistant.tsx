import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2, Minimize2, ArrowUpRight } from 'lucide-react';
import { ChatMessage, CivicIssue } from '../types';

interface AIChatAssistantProps {
  issues: CivicIssue[];
  highContrast: boolean;
}

export default function AIChatAssistant({ issues, highContrast }: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I am the CivicSphere AI Assistant. You can ask me how to report complaints, about municipal guidelines, or check the status of active issues in our wards! How can I assist you?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ sender: m.sender, text: m.text })),
          currentIssues: issues
        })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || 'Apologies, I encountered an internal communication error. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: 'Apologies, I had trouble reaching the AI proxy server. Please verify your connection or secret credentials.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          id="chat-assistant-trigger"
          className={`h-14 w-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer ${
            highContrast
              ? 'bg-yellow-400 text-black border-2 border-white'
              : 'bg-gradient-to-tr from-indigo-700 via-indigo-500 to-indigo-600 text-white'
          }`}
          title="Open AI Civic Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Expanded Chat Dialog (Glassmorphism) */}
      {isOpen && (
        <div className={`w-[350px] sm:w-[400px] h-[500px] rounded-2xl border flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-300 ${
          highContrast 
            ? 'border-yellow-400 bg-black text-white' 
            : 'bg-slate-900/95 backdrop-blur-md border-white/10 text-slate-100'
        }`}>
          {/* Header */}
          <div className="p-4 bg-slate-950/60 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Sparkles className="h-4 w-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">CivicSphere AI Assistant</h4>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 font-mono">Gemini-3.5 RAG Context</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isAssistant = m.sender === 'assistant';
              return (
                <div key={m.id} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                  <div className={`p-3 max-w-[85%] rounded-2xl text-xs leading-relaxed ${
                    isAssistant
                      ? highContrast
                        ? 'bg-slate-900 border border-yellow-400 text-white'
                        : 'bg-slate-800/80 text-slate-100 border border-white/5'
                      : highContrast
                        ? 'bg-yellow-400 text-black font-semibold'
                        : 'bg-indigo-600 text-white'
                  }`}>
                    {m.text}
                  </div>
                </div>
              );
            })}
            {sending && (
              <div className="flex justify-start">
                <div className="p-3 bg-slate-850 rounded-2xl text-xs text-slate-400 flex items-center gap-1.5 border border-white/5">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
                  <span>Gemini is reading local context...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950/60 border-t border-white/5 flex gap-2">
            <input
              type="text"
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about pothole repairs, ward lists..."
              className="flex-1 text-xs px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all shadow-md shadow-indigo-500/10"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
