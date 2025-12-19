// Terminal Component - 内置终端
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { useStore } from '../store';
import { X, Plus, ChevronUp, ChevronDown, Terminal as TerminalIcon } from 'lucide-react';
import '../styles/Terminal.css';

interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: Date;
}

interface TerminalOutput {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export function Terminal() {
  const { t } = useTranslation();
  const {
    showTerminal, toggleTerminal, terminalHeight, setTerminalHeight,
    terminals, activeTerminalId, createTerminal, closeTerminal, setActiveTerminal,
    openFolder, settings
  } = useStore();
  
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isResizing, setIsResizing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  
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
    if (!input.trim() || isExecuting) return;

    const newLine: TerminalLine = {
      id: ++lineIdRef.current,
      type: 'input',
      content: `$ ${input}`,
      timestamp: new Date(),
    };
    setLines(prev => [...prev, newLine]);
    setHistory(prev => [input, ...prev].slice(0, 100));
    setHistoryIndex(-1);

    const cmd = input.trim();
    const cmdLower = cmd.toLowerCase();
    
    // Handle built-in commands
    if (cmdLower === 'clear' || cmdLower === 'cls') {
      setLines([]);
      setInput('');
      return;
    }
    
    setInput('');
    setIsExecuting(true);
    
    try {
      // Execute command using the configured terminal type
      const result: TerminalOutput = await invoke('execute_terminal_command', {
        command: cmd,
        cwd: openFolder || undefined,
        terminalType: settings.terminalType || 'powershell',
      });
      
      // Add stdout
      if (result.stdout) {
        const outputLine: TerminalLine = {
          id: ++lineIdRef.current,
          type: 'output',
          content: result.stdout.trimEnd(),
          timestamp: new Date(),
        };
        setLines(prev => [...prev, outputLine]);
      }
      
      // Add stderr
      if (result.stderr) {
        const errorLine: TerminalLine = {
          id: ++lineIdRef.current,
          type: 'error',
          content: result.stderr.trimEnd(),
          timestamp: new Date(),
        };
        setLines(prev => [...prev, errorLine]);
      }
      
      // Show exit code if non-zero
      if (result.exitCode !== null && result.exitCode !== 0) {
        const exitLine: TerminalLine = {
          id: ++lineIdRef.current,
          type: 'error',
          content: `Process exited with code ${result.exitCode}`,
          timestamp: new Date(),
        };
        setLines(prev => [...prev, exitLine]);
      }
    } catch (error) {
      const errorLine: TerminalLine = {
        id: ++lineIdRef.current,
        type: 'error',
        content: `Error: ${error}`,
        timestamp: new Date(),
      };
      setLines(prev => [...prev, errorLine]);
    } finally {
      setIsExecuting(false);
    }
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
