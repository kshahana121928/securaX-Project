import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmergency } from '../context/EmergencyContext';

export const DisguisePage: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [notice, setNotice] = useState('');
  const { triggerSilentSos } = useEmergency();
  const navigate = useNavigate();

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
    // Normal Unlock PIN: 1234
    if (display === '1234') {
      navigate('/dashboard');
      return;
    }

    // Secret Duress Emergency PIN: 9999
    if (display === '9999') {
      await triggerSilentSos('Silent emergency triggered via full-screen disguise calculator PIN.');
      setNotice('0');
      setDisplay('0');
      setEquation('');
      return;
    }

    try {
      const fullExpr = equation + display;
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 select-none">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
        {/* Subtle Disguise Header */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-3 px-1">
          <span>Calculator</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[10px] text-slate-700 hover:text-slate-500"
          >
            Exit
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-black rounded-2xl p-5 text-right mb-6 border border-slate-900">
          <div className="text-xs text-slate-500 h-4 font-mono truncate">{equation}</div>
          <div className="text-4xl font-light text-white font-mono tracking-tight truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-3 text-xl font-medium">
          <button
            onClick={handleClear}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition active:scale-95"
          >
            C
          </button>
          <button
            onClick={() => setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev))}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition active:scale-95"
          >
            ±
          </button>
          <button
            onClick={() => handleOperator('%')}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition active:scale-95"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition active:scale-95"
          >
            ÷
          </button>

          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleNumber(d)}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('*')}
            className="p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition active:scale-95"
          >
            ×
          </button>

          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              onClick={() => handleNumber(d)}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('-')}
            className="p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition active:scale-95"
          >
            -
          </button>

          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              onClick={() => handleNumber(d)}
              className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="p-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl transition active:scale-95"
          >
            +
          </button>

          <button
            onClick={() => handleNumber('0')}
            className="col-span-2 p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition active:scale-95 text-left pl-7"
          >
            0
          </button>
          <button
            onClick={() => handleNumber('.')}
            className="p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition active:scale-95"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="p-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition active:scale-95"
          >
            =
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-900 text-center">
          <p className="text-[11px] text-slate-600 font-mono">
            Disguise Mode • PIN 1234 = Unlock • PIN 9999 = Silent SOS
          </p>
        </div>
      </div>
    </div>
  );
};
