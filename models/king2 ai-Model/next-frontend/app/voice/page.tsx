'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceMessage {
  role: 'user' | 'assistant';
  content: string;
}

function SpeechSynthesis({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 1;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [text]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  return (
    <button
      onClick={speaking ? stop : speak}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-surface-tertiary hover:text-zinc-200"
    >
      {speaking ? (
        <>
          <svg className="h-3.5 w-3.5 animate-pulse text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="4" height="12" rx="1" />
            <rect x="14" y="6" width="4" height="12" rx="1" />
          </svg>
          إيقاف
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          استماع
        </>
      )}
    </button>
  );
}

export default function VoicePage() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('المتصفح لا يدعم التعرف على الصوت. استخدم Chrome أو Edge.');
      return;
    }

    setError('');
    const recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      if (final) {
        setTranscript(final);
      } else {
        setTranscript(event.results[event.results.length - 1][0].transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setError('لم يتم التعرف على صوت. حاول مرة أخرى.');
      } else {
        setError(`خطأ: ${event.error}`);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const sendVoiceMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: VoiceMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/king2/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini',
          messages: [
            { role: 'user', content: `[رسالة صوتية] ${text}` },
          ],
        }),
      });

      if (!res.ok) throw new Error('فشل في الحصول على رد');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('لا يوجد رد');

      const decoder = new TextDecoder();
      let fullText = '';
      const assistantMessage: VoiceMessage = { role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        const cleaned = fullText.replace(/^data:\s*/gm, '').trim();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: cleaned };
          return updated;
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setTranscript('');
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-900/30 ring-1 ring-white/10">
            <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">المحادثة الصوتية</h1>
          <p className="mt-2 text-zinc-400">تحدث مع KING2 بصوتك — بالعربية</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400 ring-1 ring-red-500/20"
          >
            {error}
          </motion.div>
        )}

        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-2xl shadow-sky-900/30 ring-1 ring-white/10">
              <svg className={`h-10 w-10 text-white ${isListening ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <button
              onClick={toggleListening}
              className={`mb-6 rounded-full px-8 py-4 text-lg font-semibold transition-all active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30 animate-pulse'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-900/30 hover:from-sky-500 hover:to-blue-500'
              }`}
            >
              {isListening ? 'اضغط للإيقاف' : 'اضغط للتحدث'}
            </button>
            <p className="text-sm text-zinc-500">اضغط على الزر وابدأ التحدث</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-surface-elevated'
                      : 'bg-gradient-to-br from-sky-500 to-blue-600'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <svg className="h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-sky-600 text-white'
                      : 'rounded-tl-sm bg-surface-tertiary text-zinc-100 ring-1 ring-zinc-800/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-7">{msg.content || (index === messages.length - 1 && isProcessing ? '...' : '')}</p>
                  {msg.role === 'assistant' && msg.content && (
                    <div className="mt-2 flex items-center gap-2">
                      <SpeechSynthesis text={msg.content} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />

        {transcript && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-center"
          >
            <p className="mb-3 text-sm text-zinc-300">{transcript}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => sendVoiceMessage(transcript)}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm text-white transition-colors hover:bg-sky-500"
              >
                إرسال
              </button>
              <button
                onClick={() => setTranscript('')}
                className="rounded-lg bg-surface-tertiary px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        )}

        {messages.length > 0 && (
          <div className="mt-6 flex justify-center gap-4 border-t border-zinc-800/50 pt-6">
            <button
              onClick={toggleListening}
              className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30 animate-pulse'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-lg shadow-sky-900/30 hover:from-sky-500 hover:to-blue-500'
              }`}
            >
              <svg className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              {isListening ? 'إيقاف التسجيل' : 'تحدث'}
            </button>
            <button
              onClick={clearChat}
              className="flex items-center gap-2 rounded-full border border-zinc-700 px-6 py-3 text-sm text-zinc-400 transition-colors hover:bg-surface-tertiary hover:text-zinc-200"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              محادثة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
