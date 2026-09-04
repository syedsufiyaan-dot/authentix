export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface PasswordCriteria {
  minLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  criteria: PasswordCriteria;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const criteria: PasswordCriteria = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const validCount = Object.values(criteria).filter(Boolean).length;
  
  let score = 0;
  let label: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  let color = '#FF5C6C';

  if (validCount <= 2) {
    score = 1;
    label = 'Weak';
    color = '#FF5C6C';
  } else if (validCount === 3) {
    score = 2;
    label = 'Fair';
    color = '#FFB84D';
  } else if (validCount === 4) {
    score = 3;
    label = 'Good';
    color = '#20B8FF';
  } else if (validCount === 5) {
    score = 4;
    label = 'Strong';
    color = '#39E58C';
  }

  return { score, label, color, criteria };
}

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
