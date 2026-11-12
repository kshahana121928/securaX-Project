import React, { useState } from 'react';
import { useEmergency } from '../../context/EmergencyContext';
import { safetyService } from '../../services/safetyService';

interface DisguiseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisguiseModal: React.FC<DisguiseModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [subtleNotice, setSubtleNotice] = useState('');
  const { triggerSilentSos } = useEmergency();

  if (!isOpen) return null;

  const handleNumber = (digit: string) => {
    setDisplay((prev) => (prev === '0' ? digit : prev + digit));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleCalculate = async () => {
    // Check for Secret PIN codes:
    // Normal Unlock PIN: 1234
    // Secret Duress Emergency PIN: 9999
    if (display === '1234') {
      onClose();
      return;
    }

    if (display === '9999') {
      // SILENT SOS ACTIVATION!
      await triggerSilentSos('Silent emergency triggered via disguise calculator PIN.');
      setSubtleNotice('Ready');
      setDisplay('0');
      setEquation('');
      setTimeout(() => setSubtleNotice(''), 3000);
      return;
    }

    try {
      // Normal arithmetic calculation
      const fullExpr = equation + display;
      // Sanitize input to digits and standard operators only
      if (/^[0-9+\-*/. ]+$/.test(fullExpr)) {
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${fullExpr})`)();
        setDisplay(String(result));
        setEquation('');
      } else {
        setDisplay('Error');
      }
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 select-none">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between">
        {/* Subtle Disguise Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
          <span>Calculator</span>
          {subtleNotice && <span className="text-slate-400 font-mono text-[10px]">{subtleNotice}</span>}
          <button
            onClick={onClose}
            className="text-[10px] text-slate-600 hover:text-slate-400"
            title="Exit Stealth"
          >
            ✕
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 rounded-2xl p-4 text-right mb-4 border border-slate-800/80">
          <div className="text-xs text-slate-400 h-4 font-mono truncate">{equation}</div>
          <div className="text-3xl font-light text-white font-mono tracking-tight truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2.5 text-lg font-medium">
          <button
            onClick={handleClear}
            className="p-3.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-2xl transition active:scale-95"
          >
            C
          </button>
          <button
            onClick={() => setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev))}
            className="p-3.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-2xl transition active:scale-95"
          >
            ±
          </button>
          <button
            onClick={() => handleOperator('%')}
            className="p-3.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded-2xl transition active:scale-95"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="p-3.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-2xl transition active:scale-95"
          >
            ÷
          </button>

          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleNumber(d)}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('*')}
            className="p-3.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-2xl transition active:scale-95"
          >
            ×
          </button>

          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              onClick={() => handleNumber(d)}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('-')}
            className="p-3.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-2xl transition active:scale-95"
          >
            -
          </button>

          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              onClick={() => handleNumber(d)}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="p-3.5 bg-amber-600/80 hover:bg-amber-600 text-white rounded-2xl transition active:scale-95"
          >
            +
          </button>

          <button
            onClick={() => handleNumber('0')}
            className="col-span-2 p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition active:scale-95 text-left pl-6"
          >
            0
          </button>
          <button
            onClick={() => handleNumber('.')}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition active:scale-95"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition active:scale-95"
          >
            =
          </button>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500">
            PIN Hint: 1234 = Unlock | 9999 = Silent SOS
          </p>
        </div>
      </div>
    </div>
  );
};
