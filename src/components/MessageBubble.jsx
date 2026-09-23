import { formatTime } from '../utils/format';

export default function MessageBubble({ message, isMine, senderName }) {
  return (
    <div className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
      <div className="message-bubble">
        {!isMine && senderName && <span className="sender-name">{senderName}</span>}
        {message.text}
        <span className="msg-time">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
