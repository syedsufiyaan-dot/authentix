import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, disabled = false }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      const lastDigit = val.slice(-1);
      const nextOtp = [...value];
      nextOtp[index] = lastDigit;
      onChange(nextOtp);

      if (lastDigit && index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{1,6}$/.test(pasted)) {
      const digits = pasted.split('').slice(0, 6);
      const nextOtp = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        nextOtp[i] = d;
      });
      onChange(nextOtp);
      const targetIndex = Math.min(digits.length, 5);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 md:gap-3">
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className="w-11 h-13 md:w-13 md:h-14 text-center text-xl md:text-2xl font-mono font-bold rounded-xl glass-input border border-bg-border focus:border-accent-teal focus:ring-1 focus:ring-accent-teal disabled:opacity-50"
        />
      ))}
    </div>
  );
};
