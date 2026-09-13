'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, ShieldCheck, AlertCircle, Loader2, Delete, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

export const PasscodeScreen: React.FC = () => {
  const { login } = useAuth();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first empty digit on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleDigitChange = (index: number, val: string) => {
    setError(null);
    const cleanVal = val.replace(/\D/g, '');

    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // If user pasted a multi-digit string (e.g. "163216")
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setDigits(newDigits);
      if (newDigits.every((d) => d !== '')) {
        submitPasscode(newDigits.join(''));
      } else {
        const nextEmpty = newDigits.findIndex((d) => d === '');
        if (nextEmpty !== -1) inputRefs.current[nextEmpty]?.focus();
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal[0];
    setDigits(newDigits);

    // If we filled the 6th digit, submit automatically
    if (index === 5 && newDigits.every((d) => d !== '')) {
      submitPasscode(newDigits.join(''));
    } else if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'Enter') {
      const code = digits.join('');
      if (code.length === 6) {
        submitPasscode(code);
      }
    }
  };

  const handleKeypadPress = (val: string) => {
    if (isSubmitting) return;
    setError(null);

    if (val === 'BACKSPACE') {
      // Find last non-empty digit
      const lastIndex = digits.map((d) => d !== '').lastIndexOf(true);
      if (lastIndex !== -1) {
        const newDigits = [...digits];
        newDigits[lastIndex] = '';
        setDigits(newDigits);
        inputRefs.current[lastIndex]?.focus();
      }
      return;
    }

    if (val === 'CLEAR') {
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    // Find first empty index
    const nextIndex = digits.findIndex((d) => d === '');
    if (nextIndex !== -1) {
      const newDigits = [...digits];
      newDigits[nextIndex] = val;
      setDigits(newDigits);

      if (nextIndex === 5 && newDigits.every((d) => d !== '')) {
        submitPasscode(newDigits.join(''));
      } else if (nextIndex < 5) {
        inputRefs.current[nextIndex + 1]?.focus();
      }
    }
  };

  const submitPasscode = async (passcode: string) => {
    setIsSubmitting(true);
    setError(null);

    const res = await login(passcode);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Incorrect passcode');
      triggerShake();
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#070b12] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center relative z-10">
        {/* Logo and Lock Card */}
        <div
          className={`w-full bg-white dark:bg-[#0c121e]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-7 shadow-2xl space-y-6 text-center transition-all ${
            shake ? 'animate-shake' : ''
          }`}
        >
          {/* Brand Icon */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-1.5 shadow-lg shadow-indigo-500/10 flex items-center justify-center">
                <img src="/crm.png" alt="SoloCRM" className="w-full h-full object-contain rounded-xl" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-full shadow-md">
                <Lock className="w-3 h-3 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Solo<span className="text-emerald-600 dark:text-emerald-400">CRM</span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your 6-digit security passcode to unlock
              </p>
            </div>
          </div>

          {/* 6 Digit Input Boxes */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={isSubmitting}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onFocus={(e) => e.target.select()}
                  className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-bold font-mono rounded-xl border transition-all ${
                    digit
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-400 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 py-1.5 px-3 rounded-xl animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {isSubmitting && (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </div>
            )}
          </div>

          {/* Numeric Keypad */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleKeypadPress(num)}
                  className="py-3 text-base font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95 shadow-xs"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleKeypadPress('CLEAR')}
                className="py-3 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95"
              >
                Clear
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleKeypadPress('0')}
                className="py-3 text-base font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/70 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95 shadow-xs"
              >
                0
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleKeypadPress('BACKSPACE')}
                className="py-3 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-xl transition-all active:scale-95"
                title="Delete"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session • Passcode Protected</span>
        </div>
      </div>
    </div>
  );
};
