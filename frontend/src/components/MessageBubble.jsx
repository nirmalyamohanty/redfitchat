import { useState } from 'react';
import { translate as translateApi } from '../api';
import { messages as messagesApi } from '../api';

export default function MessageBubble({ msg, onReply, onUserClick, isOwn }) {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const displayText = showTranslated && translated ? translated : (msg.text || '');

  const handleTranslate = () => {
    if (!msg.text) return;
    if (translated) {
      setShowTranslated(!showTranslated);
      return;
    }
    setLoading(true);
    translateApi.text(msg.text, 'en')
      .then(({ data }) => {
        setTranslated(data.translatedText);
        setShowTranslated(true);
      })
      .catch(() => setTranslated(msg.text))
      .finally(() => setLoading(false));
  };

  const username = msg.senderId?.username || msg.senderId || 'anon';
  const pic = msg.senderId?.profilePic;

  return (
    <div className={`flex gap-3 group animate-fade-in ${isOwn ? 'flex-row-reverse' : ''}`}>
      <img
        src={pic || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`}
        alt=""
        className="w-8 h-8 rounded-full flex-shrink-0 mt-1 object-cover border-2 border-transparent group-hover:border-primary/50 transition-colors"
      />
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`
          relative px-4 py-3 rounded-2xl shadow-sm
          ${isOwn
            ? 'bg-gradient-to-br from-primary to-primary-hover text-white rounded-tr-sm'
            : 'glass-card text-gray-100 rounded-tl-sm'}
        `}>
          {!isOwn && (
            <div
              onClick={() => onUserClick && onUserClick(msg.senderId)}
              className="text-xs font-bold text-primary mb-1 cursor-pointer hover:underline"
              title="Click to DM"
            >
              {username}
            </div>
          )}

          {(msg.replyToMessageId || msg.replyContext) && (
            <div className={`text-xs border-l-2 pl-2 mb-2 ${isOwn ? 'border-white/30 text-white/70' : 'border-primary/50 text-gray-400'}`}>
              <div className="font-medium opacity-75">Replying to {(msg.replyToMessageId?.senderId?.username) || msg.replyContext?.originalSender || 'user'}</div>
              <div className="truncate opacity-50">{msg.replyToMessageId?.text || msg.replyContext?.originalText || ''}</div>
            </div>
          )}

          {msg.mediaUrl && (
            <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
              {msg.mediaType === 'image' && <img src={msg.mediaUrl} alt="" className="max-w-full max-h-64 object-cover" loading="lazy" />}
              {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="max-w-full max-h-64 bg-black" />}
              {msg.mediaType === 'file' && (
                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-black/20 hover:bg-black/40 transition">
                  <span className="text-xl">📄</span>
                  <span className="underline text-sm font-medium">Open file</span>
                </a>
              )}
            </div>
          )}

          <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
            {displayText || (msg.mediaUrl ? '' : '(empty)')}
          </div>

          <div className={`flex items-center gap-3 mt-1 ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
            <span className="text-[10px] uppercase tracking-wider">{new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {msg.text && (
              <button
                onClick={handleTranslate}
                className={`text-[10px] hover:underline ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? 'Translating...' : showTranslated ? 'Show Original' : 'Translate'}
              </button>
            )}
          </div>
        </div>

        <div className={`flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <button onClick={onReply} className="text-xs font-medium text-gray-400 hover:text-primary transition-colors">Reply</button>
          {/* {!isOwn && <button onClick={() => messagesApi.report(msg._id, '')} className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors">Report</button>} */}
        </div>
      </div>
    </div>
  );
}
