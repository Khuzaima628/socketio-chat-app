import { useEffect, useRef } from 'react';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { formatLastSeen } from '../utils/format';

export default function ChatWindow({
  title,
  avatar,
  statusLine,
  messages,
  currentUserId,
  getSenderName,
  typingLabel,
  onSend,
  onTyping,
  headerAction,
  onBack,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-main">
      
      <div className="chat-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">←</button>
        <Avatar src={avatar} alt={title} size={38} />
        <div className="info">
          <div className="name">{title}</div>
          <div className="status-line">{statusLine}</div>
        </div>
        {headerAction}
      </div>

      <div className="message-list" ref={listRef}>
        {messages.length === 0 ? (
          <p className="empty-hint">No messages yet. Say hi 👋</p>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isMine={m.senderId === currentUserId}
              senderName={getSenderName?.(m.senderId)}
            />
          ))
        )}
      </div>

      <TypingIndicator name={typingLabel} />

      <MessageInput onSend={onSend} onTyping={onTyping} />
    </div>
  );
}

export function formatStatusLine(status, lastSeen) {
  if (status === 'online') return '🟢 Online';
  return lastSeen ? `⚫ Last seen ${formatLastSeen(lastSeen)}` : '⚫ Offline';
}
