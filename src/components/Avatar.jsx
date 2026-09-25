export default function Avatar({ src, alt, size = 40, status }) {
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <img
        className="avatar"
        src={src}
        alt={alt || 'Avatar'}
        width={size}
        height={size}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(alt || 'User')}`;
        }}
      />
      {status && <span className={`status-dot ${status}`} />}
    </div>
  );
}
