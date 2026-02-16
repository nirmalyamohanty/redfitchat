import { useState, useRef, useEffect } from 'react';
import { ai } from '../api';
import Navbar from '../components/Navbar';

export default function AIChat() {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('ai_chat_history');
        return saved ? JSON.parse(saved) : [{ role: 'model', text: 'Hello! I\'m RedFit AI. How can I help you today?' }];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('ai_chat_history', JSON.stringify(messages));
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await ai.chat(input);
            setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error';
            setMessages(prev => [...prev, { role: 'model', text: `Error: ${errorMsg}` }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        localStorage.removeItem('ai_chat_history');
        setMessages([{ role: 'model', text: 'Hello! I\'m RedFit AI. How can I help you today?' }]);
    };

    return (
        <div className="flex flex-col h-screen bg-dark-950">
            <Navbar />
            <div className="flex-1 overflow-hidden relative pt-16 flex flex-col max-w-4xl mx-auto w-full">
                {/* Static Background */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-600/5 via-dark-950 to-dark-950"></div>

                {/* Header / Clear Button */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={clearChat}
                        className="text-xs text-gray-500 hover:text-red-400 bg-dark-800/50 px-3 py-1 rounded-full border border-white/5 hover:border-red-500/30 transition-all"
                    >
                        Clear Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 border ${msg.role === 'user'
                                ? 'bg-primary/20 border-primary/30 text-white rounded-tr-sm'
                                : 'glass-card text-gray-200 rounded-tl-sm'
                                }`}>
                                {msg.role === 'model' && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse"></div>
                                        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">RedFit AI</span>
                                    </div>
                                )}
                                <div className="whitespace-pre-wrap">{msg.text}</div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="p-4 z-10">
                    <div className="relative glass rounded-xl p-1 flex items-center gap-2 border border-white/10">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                            placeholder="Message RedFit AI..."
                            className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500"
                        />
                        <button
                            onClick={send}
                            disabled={loading || !input.trim()}
                            className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
