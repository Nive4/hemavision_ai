import React from 'react';

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md leading-relaxed ${
        isUser 
          ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-br-none'
          : 'bg-slate-900/80 border border-slate-800/80 text-slate-100 rounded-bl-none backdrop-blur-md'
      }`}>
        <span className="text-[10px] font-extrabold uppercase tracking-wider block mb-1 opacity-70">
          {isUser ? 'You' : 'HemaVision AI'}
        </span>
        
        {/* Simple inline formatting helper for Markdown-style lists/headers */}
        <div className="whitespace-pre-line text-xs md:text-sm">
          {message.text}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
