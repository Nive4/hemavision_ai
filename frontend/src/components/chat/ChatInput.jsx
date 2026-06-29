import React, { useState } from 'react';

const ChatInput = ({ onSend, loading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !loading) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-900">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask about iron absorption, heme vs non-heme, symptoms..."
        className="flex-1 bg-transparent border-0 outline-none text-slate-200 text-xs px-3 focus:ring-0 focus:outline-none"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs transition-colors disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
