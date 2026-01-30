// src/hooks/useUppercase.js
import { useEffect } from 'react';

export function useUppercase() {
  const toUpperCase = (text) => {
    if (!text || typeof text !== 'string') return text;
    return text.toUpperCase();
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    }
    return phone;
  };

  return { toUpperCase, formatPhone };
}

// Hook para inputs em caixa alta
export function useUppercaseInput(ref) {
  useEffect(() => {
    if (!ref.current) return;

    const input = ref.current;
    
    const handleInput = (e) => {
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      e.target.value = e.target.value.toUpperCase();
      e.target.setSelectionRange(start, end);
    };

    input.addEventListener('input', handleInput);
    
    return () => {
      input.removeEventListener('input', handleInput);
    };
  }, [ref]);
}