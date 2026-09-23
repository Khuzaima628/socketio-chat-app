import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  function handleDigitChange(index, value) {
    if (value && !/^\d$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleVerify(e) {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    // Mock: any complete 6-digit code is accepted.
    console.log('[mock] OTP verified:', otp);
    navigate('/login');
  }

  function handleResend() {
    const fakeOtp = '123456';
    const email = sessionStorage.getItem('pendingEmail') || 'your email';
    console.log(`[mock] Resent OTP to ${email}: ${fakeOtp}`);
    setCountdown(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify your email</h1>
        <p className="subtitle">Enter the 6-digit code we sent you.</p>

        <form onSubmit={handleVerify}>
          <div className="otp-inputs">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                inputMode="numeric"
              />
            ))}
          </div>

          {error && <p className="field-error">{error}</p>}

          <button type="submit" className="btn-primary">Verify OTP</button>
        </form>

        <div className="resend-row">
          {countdown > 0 ? (
            <span>Resend code in {countdown}s</span>
          ) : (
            <button type="button" onClick={handleResend}>Resend OTP</button>
          )}
        </div>
      </div>
    </div>
  );
}
