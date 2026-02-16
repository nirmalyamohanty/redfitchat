import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { chats as chatsApi, messages as messagesApi, upload as uploadApi, users as usersApi } from '../api';
import MessageBubble from '../components/MessageBubble';

export default function PersonalChat() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [typing, setTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    chatsApi.list().then(({ data }) => setChatList(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      usersApi.search(searchQuery).then(({ data }) => setSearchResults(data)).catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (chatId) {
      const chat = chatList.find(c => c._id === chatId);
      if (chat) setActiveChat(chat);
      else chatsApi.list().then(({ data }) => {
        const c = data.find(x => x._id === chatId);
        setActiveChat(c);
        setChatList(data);
      });
    } else {
      setActiveChat(null);
      setMsgs([]);
    }
  }, [chatId, chatList]);

  useEffect(() => {
    if (!activeChat) return;
    messagesApi.personal(activeChat._id).then(({ data }) => setMsgs(data)).catch(console.error);
  }, [activeChat?._id]);

  useEffect(() => {
    if (!socket || !activeChat) return;
    socket.emit('personal:join', activeChat._id);
    socket.on('personal:message', (msg) => {
      if (msg.chatId === activeChat._id) {
        setMsgs((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });
    socket.on('personal:typing', (payload) => {
      if (payload.chatId === activeChat._id && payload.userId !== user?._id) setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });
    return () => {
      socket.off('personal:message');
      socket.off('personal:typing');
    };
  }, [socket, activeChat?._id, user?._id]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [msgs]);

  const startChat = async (userId) => {
    try {
      const { data } = await chatsApi.withUser(userId);
      navigate(`/chat/${data._id}`);
      setChatList((prev) => {
        if (prev.some(c => c._id === data._id)) return prev;
        return [data, ...prev];
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to start chat');
    }
  };

  const send = () => {
    if (!input.trim() || !socket || !activeChat) return;

    const replyToData = replyingTo ? {
      _id: replyingTo._id,
      text: replyingTo.text,
      username: replyingTo.senderId?.username || replyingTo.senderId || 'anon'
    } : null;

    socket.emit('personal:message', {
      chatId: activeChat._id,
      text: input.trim(),
      replyTo: replyToData
    }, () => setInput('') || setReplyingTo(null));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !socket || !activeChat) return;
    try {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'file';
      const { data } = await uploadApi.file(file, type);

      const replyToData = replyingTo ? {
        _id: replyingTo._id,
        text: replyingTo.text,
        username: replyingTo.senderId?.username || replyingTo.senderId || 'anon'
      } : null;

      socket.emit('personal:message', {
        chatId: activeChat._id,
        text: input || '',
        mediaUrl: data.url,
        mediaType: type,
        replyTo: replyToData
      }, () => setInput('') || setReplyingTo(null));
    } catch (err) {
      console.error(err);
    }
  };

  const otherUser = activeChat?.otherUser || activeChat?.participants?.find(p => p && p._id !== user?._id);

  return (
    <div className="pt-16 h-screen flex bg-dark-950 relative overflow-hidden">
      {/* Gen Z Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="w-80 border-r border-white/5 flex flex-col glass z-10">
        <div className="p-4 space-y-4">
          <h2 className="text-xl font-display font-bold text-white px-2">Messages</h2>
          <div className="relative group">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-dark-700/50 text-white text-sm rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-white/5"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="px-4 pb-2">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Found Users</div>
            {searchResults.map((u) => (
              <button
                key={u._id}
                onClick={() => startChat(u._id)}
                className="w-full text-left px-3 py-3 flex items-center gap-3 hover:bg-white/5 rounded-xl transition-all group"
              >
                <img src={u.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.username}`} alt="" className="w-10 h-10 rounded-full border-2 border-transparent group-hover:border-primary transition-colors" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">{u.username}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          {chatList.length === 0 && searchResults.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-sm">No chats yet</div>
          )}
          {chatList.map((c) => {
            const o = c.otherUser || c.participants?.find(p => p && p._id !== user?._id);
            const isActive = c._id === chatId;
            return (
              <button
                key={c._id}
                onClick={() => navigate(`/chat/${c._id}`)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl transition-all group ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-white/5 border border-transparent'}`}
              >
                <div className="relative">
                  <img src={o?.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${o?.username}`} alt="" className="w-12 h-12 rounded-full object-cover" />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-800 ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isActive ? 'text-primary' : 'text-gray-200 group-hover:text-white'}`}>{o?.username}</div>
                  <div className="text-xs text-gray-500 truncate">{c.lastMessage?.text || 'No messages yet'}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-dark-900 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-dark-900 to-dark-900 pointer-events-none"></div>

        {activeChat ? (
          <>
            <div className="px-6 py-4 border-b border-white/5 bg-dark-800/30 backdrop-blur-md flex items-center gap-4 z-10">
              <img src={otherUser?.profilePic || `https://api.dicebear.com/7.x/identicon/svg?seed=${otherUser?.username}`} alt="" className="w-10 h-10 rounded-full border border-white/10" />
              <div>
                <h3 className="font-bold text-white">{otherUser?.username}</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-400">Online</span>
                </div>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4 z-0">
              {msgs.map((msg) => (
                <MessageBubble
                  key={msg._id}
                  msg={msg}
                  onReply={() => setReplyingTo(msg)}
                  isOwn={msg.senderId?._id === user?._id || msg.senderId === user?._id}
                />
              ))}
              {typing && <div className="text-sm text-primary/70 italic px-2 animate-pulse">Typing...</div>}
            </div>

            {replyingTo && (
              <div className="px-6 py-2 bg-dark-800/80 border-t border-white/5 flex items-center justify-between backdrop-blur-md z-10">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-primary font-bold">Replying to {replyingTo.senderId?.username}</span>
                    <span className="text-xs text-gray-400 truncate max-w-xs">{replyingTo.text}</span>
                  </div>
                </div>
                <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white">Cancel</button>
              </div>
            )}

            <div className="p-4 border-t border-white/5 z-10 bg-dark-900/50 backdrop-blur-lg">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <label className="cursor-pointer p-3 rounded-xl bg-dark-700/50 hover:bg-primary/20 hover:text-primary transition-all text-gray-400 border border-white/5 group">
                  <input type="file" className="hidden" onChange={handleFile} accept="image/*,video/*,.pdf,.doc,.docx" />
                  <span className="block transform group-hover:scale-110 transition-transform">📎</span>
                </label>
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      socket?.emit('personal:typing', activeChat._id);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                    autoComplete="off"
                    placeholder="Type a message..."
                    className="w-full bg-dark-700/50 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all border border-white/5"
                  />
                  <button
                    onClick={send}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primary-hover text-white rounded-lg shadow-lg shadow-primary/20 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform rotate-90" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4">
            <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center border border-white/5">
              <span className="text-4xl">💬</span>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Your Messages</h3>
              <p className="max-w-xs mx-auto">Select a chat from the sidebar or search for a user to start conversing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
