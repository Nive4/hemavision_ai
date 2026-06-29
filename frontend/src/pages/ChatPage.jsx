import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import { 
  MessageSquareHeart, 
  Send, 
  Bot, 
  UserCircle,
  HelpCircle,
  Loader,
  RefreshCw
} from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your HemaVision AI health assistant. I can answer questions about anemia, iron-rich nutrition, dietary enhancers, inhibitors, and how our image-based screening models work. How can I help you today?"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Predefined quick questions for easy interaction
  const SUGGESTED_QUESTIONS = [
    "What is heme vs non-heme iron?",
    "How can I maximize iron absorption?",
    "What blocks iron absorption?",
    "How does HemaVision AI analyze eye conjunctive pallor?",
    "What are normal hemoglobin ranges?"
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    if (!textToSend) {
      setInputText("");
    }

    // Append user message
    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setLoading(true);

    try {
      const res = await api.post("/chat", { message: query });
      setMessages(prev => [...prev, { sender: "bot", text: res.data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev, 
        { 
          sender: "bot", 
          text: "⚠️ Sorry, I failed to connect to the AI assistant. Please make sure the backend server is running." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    if (loading) return;
    handleSendMessage(question);
  };

  // Basic custom markdown parser to convert **bold**, * bullets, and ### headings to HTML
  const parseMarkdown = (text) => {
    if (!text) return "";
    
    let html = text;
    // Replace markdown headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-text-primary mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-text-primary mt-5 mb-2 border-b border-white/5 pb-1">$1</h2>');
    
    // Replace bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-accent-secondary">$1</strong>');
    
    // Replace bullets (lines starting with * or -)
    html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc mb-1 text-[11px]">$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc mb-1 text-[11px]">$1</li>');
    
    // Handle newlines
    html = html.replace(/\n/g, '<br />');
    
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col h-[calc(100vh-100px)]">
      
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold bg-accent-gradient bg-clip-text text-transparent flex items-center gap-3">
          <MessageSquareHeart className="w-8 h-8 text-accent-primary" />
          <span>AI Health Assistant Chat</span>
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Chat with our contextual assistant to learn about foods, enhancers, inhibitors, and screening details.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Left/Middle: Chat Terminal (3 cols) */}
        <div className="lg:col-span-3 glass-panel rounded-3xl flex flex-col min-h-0">
          
          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
            {messages.map((msg, index) => {
              const isBot = msg.sender === "bot";
              return (
                <div 
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${isBot ? "self-start" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${isBot ? "bg-accent-primary/10 border-accent-primary/20 text-accent-primary" : "bg-white/5 border-white/10 text-text-secondary"}`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <UserCircle className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${isBot ? "bg-white/5 border border-white/5 text-text-secondary" : "bg-accent-gradient text-white shadow-md shadow-accent-primary/10"}`}>
                    {isBot ? parseMarkdown(msg.text) : msg.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 max-w-[80%] self-start">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center border bg-accent-primary/10 border-accent-primary/20 text-accent-primary shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2 text-xs text-text-secondary">
                  <Loader className="w-3.5 h-3.5 animate-spin text-accent-primary" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form input field */}
          <div className="p-4 border-t border-white/5 flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask about iron blockers, boosters, symptoms..."
              disabled={loading}
              className="flex-1 bg-bg-primary text-xs text-text-primary px-4 py-3.5 rounded-xl border border-white/5 focus:border-accent-primary/30 outline-none transition-all disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              className="p-3.5 bg-accent-gradient text-white rounded-xl shadow-md hover:shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Right Column: Predefined Suggestions (1 col) */}
        <div className="glass-panel p-5 rounded-3xl space-y-4 self-start hidden lg:block">
          <div className="text-xs font-bold text-text-primary flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent-primary" />
            <span>Suggested Topics</span>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            Click any question to ask the AI assistant immediately:
          </p>
          <div className="space-y-2">
            {SUGGESTED_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(question)}
                disabled={loading}
                className="w-full text-left text-[10px] p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent-primary/20 transition-all text-text-secondary hover:text-text-primary leading-normal disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
