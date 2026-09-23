export default function TypingIndicator({ name }) {
  return (
    <div className="typing-indicator">
      {name && (
        <>
          {name} is typing
          <span className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </>
      )}
    </div>
  );
}
