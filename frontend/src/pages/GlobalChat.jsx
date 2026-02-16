import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { messages as messagesApi, upload as uploadApi } from '../api';
import MessageBubble from '../components/MessageBubble';

export default function GlobalChat() {
  const socket = useSocket();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const listRef = useRef(null);

  // Initial fetch moved to socket effect to handle reconnections
  // useEffect(() => {
  //   messagesApi.global().then(({ data }) => setMsgs(data)).catch(console.error);
  // }, []);

  useEffect(() => {
    if (!socket) return;

    const fetchMessages = () => {
      messagesApi.global().then(({ data }) => setMsgs(data)).catch(console.error);
    };

    // Initial fetch
    fetchMessages();

    socket.on('connect', fetchMessages); // Re-fetch on reconnection
    socket.emit('global:join');
    socket.on('global:message', (msg) => {
      setMsgs((prev) => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });
    socket.on('global:typing', (payload) => {
      setTyping(payload);
      const t = setTimeout(() => setTyping(null), 2000);
      return () => clearTimeout(t);
    });
    return () => {
      socket.off('global:message');
      socket.off('global:typing');
    };
  }, [socket]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [msgs]);

  const [sending, setSending] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Removed duplicate check to allow re-sending

    const replyTo = replyingTo;
    setInput('');
    setReplyingTo(null);
    setSending(true);

    try {
      const { data } = await messagesApi.sendGlobal({
        text,
        replyTo: replyTo ? {
          _id: replyTo._id,
          text: replyTo.text,
          username: replyTo.senderId?.username || replyTo.senderId || 'anon'
        } : null
      });
      // Correctly add message only if it doesn't exist (socket might have added it already)
      setMsgs((prev) => {
        if (prev.some(m => m._id === data._id)) return prev;
        return [...prev, data];
      });
    } catch (err) {
      console.error(err);
      setInput(text); // Restore text on failure
      setReplyingTo(replyTo);
      alert(err.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
      // Re-focus input after sending
      const inputEl = document.querySelector('input[placeholder="Type a message..."]');
      inputEl?.focus();
    }
  };

  const handleTyping = () => {
    socket?.emit('global:typing');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      const { data: uploadData } = await uploadApi.file(file, type);
      const { data } = await messagesApi.sendGlobal({
        text: input || '',
        mediaUrl: uploadData.url,
        mediaType: type,
        replyTo: replyingTo ? {
          _id: replyingTo._id,
          text: replyingTo.text,
          username: replyingTo.senderId?.username || replyingTo.senderId || 'anon'
        } : null
      });
      setInput('');
      setReplyingTo(null);
      setMsgs((m) => [...m, data]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-16 h-screen flex flex-col bg-dark-950 relative overflow-hidden">
      {/* Gen Z Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative flex-1 flex flex-col max-w-5xl mx-auto w-full glass my-4 rounded-3xl overflow-hidden shadow-neon border border-white/10 z-10 mx-4 lg:mx-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-primary blur-md animate-pulse"></div>
            </div>
            <div>
              <h2 className="font-display font-bold text-xl tracking-tight text-white">Global Chat</h2>
              <p className="text-xs text-gray-400 font-mono">v2.0 • Online</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary tracking-widest uppercase shadow-[0_0_10px_rgba(255,69,0,0.2)]">
            LIVE
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
          {msgs.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              onReply={() => setReplyingTo(msg)}
              isOwn={msg.senderId?._id == user?._id || msg.senderId == user?._id}
            />
          ))}
          {typing && <div className="text-sm text-primary/70 italic animate-pulse px-2">{typing.username} is typing...</div>}
        </div>

        {replyingTo && (
          <div className="px-6 py-2 bg-dark-800/80 border-t border-white/5 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-1 h-8 bg-primary rounded-full"></div>
              <div className="flex flex-col">
                <span className="text-xs text-primary font-bold">Replying to {replyingTo.senderId?.username || 'anon'}</span>
                <span className="text-xs text-gray-400 truncate max-w-xs">{replyingTo.text}</span>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}

        <div className="p-4 border-t border-white/5 bg-dark-800/50 backdrop-blur-md flex gap-3">
          <label className="cursor-pointer p-3 rounded-xl bg-dark-700/50 hover:bg-primary/20 hover:text-primary transition-all text-gray-400 border border-white/5 hover:border-primary/30 group">
            <input type="file" className="hidden" onChange={handleFile} disabled={uploading} accept="image/*,video/*,.pdf,.doc,.docx" />
            <span className={`block transform transition-transform group-hover:scale-110 ${uploading ? 'animate-spin' : ''}`}>
              {uploading ? '↻' : '📎'}
            </span>
          </label>
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              autoComplete="off"
              placeholder="Type a message..."
              className="w-full bg-dark-800/50 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-dark-800/80 transition-all border border-white/10 shadow-inner"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg disabled:opacity-0 disabled:scale-75 transition-all shadow-[0_0_15px_rgba(255,69,0,0.3)] hover:shadow-[0_0_25px_rgba(255,69,0,0.5)] active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
