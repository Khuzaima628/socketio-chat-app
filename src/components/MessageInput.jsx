import { useState, useRef } from 'react';

export default function MessageInput({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  function handleChange(e) {
    setText(e.target.value);
    onTyping?.(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTyping?.(false), 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    clearTimeout(typingTimeoutRef.current);
    onTyping?.(false);
  }

  return (
    <form className="message-input-bar" onSubmit={handleSubmit}>
      <input
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
      />
      <button type="submit" disabled={!text.trim()}>
        Send
      </button>
    </form>
  );
}
