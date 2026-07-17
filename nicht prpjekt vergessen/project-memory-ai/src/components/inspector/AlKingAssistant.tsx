'use client'

import React, { useState } from 'react'
import { Sparkles, Send, Bot, User, Bookmark, History, Lightbulb } from 'lucide-react'

export function AlKingAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Marhaban! I am your AlKing Code Agent. Send me a snippet or ask for a prompt to modify your project.' }
  ])
  const [input, setInput] = useState('')
  const [notes, setNotes] = useState<string[]>([])

  const handleSend = () => {
    if (!input) return
    setMessages([...messages, { role: 'user', text: input }])
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `I've analyzed your request: "${input}". Here's a suggested prompt for Gemini: "Modify the Auth logic to use secure HttpOnly cookies and add JWT expiration handling."` 
      }])
    }, 1000)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/40">
      {/* Assistant Header */}
      <div className="p-4 border-b border-white/5 bg-slate-900/20">
        <div className="flex items-center gap-2 mb-1">
          <Bot size={18} className="text-purple-400" />
          <h2 className="text-sm font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AI AGENT ASSISTANT
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Code Audit & Support</p>
      </div>

      {/* Main Chat / Notes Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border
              ${m.role === 'assistant' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/5 border-white/10 text-slate-400'}
            `}>
              {m.role === 'assistant' ? <Sparkles size={14} /> : <User size={14} />}
            </div>
            <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%]
              ${m.role === 'assistant' ? 'bg-slate-900 text-slate-300' : 'bg-purple-600 text-white'}
            `}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Actions */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-white/5 bg-slate-900/10 no-scrollbar pb-3">
        <ActionButton icon={<Lightbulb size={12}/>} label="Suggest Prompts" />
        <ActionButton icon={<Bookmark size={12}/>} label="Save Note" />
        <ActionButton icon={<History size={12}/>} label="Audit History" />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-slate-900/30">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI for advice or prompts..."
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 p-1.5 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg text-white hover:opacity-90 transition-opacity"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon, label }: { icon: any, label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-slate-400 whitespace-nowrap hover:bg-white/10 hover:text-white transition-all">
      {icon}
      {label}
    </button>
  )
}
