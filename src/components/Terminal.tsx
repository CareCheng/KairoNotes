// Terminal Component - 内置终端
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { X, Plus, ChevronUp, ChevronDown, Terminal as TerminalIcon } from 'lucide-react';
import '../styles/Terminal.css';

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

export function Terminal() {
  const { t } = useTranslation();
  const {
    showTerminal, toggleTerminal, terminalHeight, setTerminalHeight,
    terminals, activeTerminalId, createTerminal, closeTerminal, setActiveTerminal,
    openFolder
  } = useStore();
  
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isResizing, setIsResizing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(0);

  useEffect(() => {
    if (showTerminal && terminals.length === 0) {
      createTerminal();
    }
  }, [showTerminal, terminals.length, createTerminal]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newLine: TerminalLine = {
      id: ++lineIdRef.current,
      type: 'input',
      content: `$ ${input}`,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
    setHistory(prev => [input, ...prev].slice(0, 100));
    setHistoryIndex(-1);

    // Simulate command execution
    const cmd = input.trim().toLowerCase();
    let output = '';
    
    if (cmd === 'clear' || cmd === 'cls') {
      setLines([]);
      setInput('');
      return;
    } else if (cmd === 'help') {
      output = `Available commands:
  clear/cls  - Clear terminal
  pwd        - Print working directory
  echo       - Print text
  date       - Show current date
  help       - Show this help`;
    } else if (cmd === 'pwd') {
      output = openFolder || '~';
    } else if (cmd.startsWith('echo ')) {
      output = input.slice(5);
    } else if (cmd === 'date') {
      output = new Date().toLocaleString();
    } else {
      output = `Command not found: ${input.split(' ')[0]}`;
    }

    const outputLine: TerminalLine = {
      id: ++lineIdRef.current,
      type: 'output',
      content: output,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, outputLine]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startY - e.clientY;
      const newHeight = Math.max(100, Math.min(500, startHeight + delta));
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!showTerminal) return null;

  return (
    <motion.div
      className="terminal-panel"
      initial={{ height: 0 }}
      animate={{ height: terminalHeight }}
      exit={{ height: 0 }}
      style={{ height: terminalHeight }}
    >
      <div className="terminal-resize-handle" onMouseDown={handleResizeStart} />
      
      <div className="terminal-header">
        <div className="terminal-tabs">
          {terminals.map(term => (
            <div
              key={term.id}
              className={`terminal-tab ${term.id === activeTerminalId ? 'active' : ''}`}
              onClick={() => setActiveTerminal(term.id)}
            >
              <TerminalIcon size={12} />
              <span>{term.name}</span>
              <button
                className="terminal-tab-close"
                onClick={(e) => { e.stopPropagation(); closeTerminal(term.id); }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button className="terminal-add" onClick={() => createTerminal()}>
            <Plus size={14} />
          </button>
        </div>
        
        <div className="terminal-actions">
          <button onClick={toggleTerminal}>
            {showTerminal ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button onClick={toggleTerminal}>
            <X size={16} />
          </button>
        </div>
      </div>
      
      <div className="terminal-body" ref={outputRef} onClick={() => inputRef.current?.focus()}>
        {lines.map(line => (
          <div key={line.id} className={`terminal-line ${line.type}`}>
            <pre>{line.content}</pre>
          </div>
        ))}
        
        <form className="terminal-input-line" onSubmit={handleSubmit}>
          <span className="terminal-prompt">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </form>
      </div>
    </motion.div>
  );
}
