"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface AIChatbotProps {
  userContext: {
    isLoggedIn: boolean;
    name: string;
    location: string;
  };
}

export default function AIChatbot({ userContext }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      userContext,
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: userContext.isLoggedIn 
          ? `Namaste ${userContext.name} ji! 🙏 Main Tekton Bhopal ka AI Assistant hoon. Aaj aapki kaise madad kar sakta hoon?`
          : "Namaste! 🙏 Main Tekton Bhopal ka AI Assistant hoon. Aaj aapke ghar ki repair ya maintenance mein kya madad kar sakta hoon?",
      }
    ]
  } as any) as any;

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-[60] bg-amber-500 hover:bg-amber-400 text-slate-900 p-4 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6 fill-slate-900" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
        </span>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[60] w-[calc(100vw-2rem)] sm:w-[400px] max-h-[80vh] h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Tekton Assistant</h3>
              <p className="text-[10px] text-amber-400 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                Online (Bhopal Team)
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
          {messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-amber-100 ml-2' : 'bg-slate-200 mr-2'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-amber-700" /> : <Bot className="w-4 h-4 text-slate-700" />}
                </div>

                {/* Bubble */}
                <div 
                  className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-amber-500 text-slate-900 rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 mr-2 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-slate-700" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1 bg-slate-100 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
              <textarea
                value={input || ""}
                onChange={handleInputChange || (() => {})}
                placeholder="Type your problem here..."
                className="w-full bg-transparent text-sm resize-none focus:outline-none max-h-24 min-h-[40px] py-2"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if(input && input.trim()) handleSubmit(e as any);
                  }
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !input || !input.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 p-3 rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[9px] text-slate-400 flex items-center justify-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by AI. Verified by Tekton.
            </span>
          </div>
        </div>

      </div>
    </>
  );
}
