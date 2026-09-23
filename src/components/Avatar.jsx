export default function Avatar({ src, alt, size = 40, status }) {
  return (
    <div className="avatar-wrap" style={{ width: size, height: size }}>
      <img className="avatar" src={src} alt={alt} width={size} height={size} />
      {status && <span className={`status-dot ${status}`} />}
    </div>
  );
}
