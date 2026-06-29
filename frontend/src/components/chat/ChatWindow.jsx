import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Card from '../common/Card';

const ChatWindow = ({ messages, onSend, loading }) => {
  const scrollRef = useRef(null);

  const suggestedQuestions = [
    "What is the difference between heme and non-heme iron?",
    "What foods should I avoid with iron meals?",
    "How does Vitamin C help iron absorption?",
    "What are the symptoms of anemia?"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex flex-col h-[500px] bg-slate-900/60 border border-slate-800/80">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto pr-2 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <span className="text-3xl mb-2">🤖</span>
            <h4 className="text-sm font-bold text-slate-300">Consult HemaVision AI Assistant</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Ask any questions regarding iron density, symptoms, enhancers, or inhibitors.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => <ChatMessage key={idx} message={msg} />)
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="mb-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Suggested Topics</span>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onSend(q)}
                className="bg-slate-950/80 hover:bg-slate-950 text-left text-teal-400 hover:text-teal-300 border border-slate-900 px-3 py-1.5 rounded-lg text-[10px] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input container */}
      <ChatInput onSend={onSend} loading={loading} />
    </Card>
  );
};

export default ChatWindow;
