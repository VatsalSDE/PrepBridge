import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Code lines that simulate typing ────────────────────────────
const CODE_LINES = [
  { text: 'function solve(nums, target) {', indent: 0, color: 'text-blue-400' },
  { text: 'const map = new Map();', indent: 1, color: 'text-purple-400' },
  { text: 'for (let i = 0; i < nums.length; i++) {', indent: 1, color: 'text-blue-400' },
  { text: 'const complement = target - nums[i];', indent: 2, color: 'text-emerald-400' },
  { text: 'if (map.has(complement)) {', indent: 2, color: 'text-blue-400' },
  { text: 'return [map.get(complement), i];', indent: 3, color: 'text-amber-400' },
  { text: '}', indent: 2, color: 'text-slate-400' },
  { text: 'map.set(nums[i], i);', indent: 2, color: 'text-purple-400' },
  { text: '}', indent: 1, color: 'text-slate-400' },
  { text: 'return [];', indent: 1, color: 'text-amber-400' },
  { text: '}', indent: 0, color: 'text-slate-400' },
  { text: '', indent: 0, color: '' },
  { text: 'class TreeNode {', indent: 0, color: 'text-yellow-400' },
  { text: 'constructor(val, left, right) {', indent: 1, color: 'text-blue-400' },
  { text: 'this.val = val;', indent: 2, color: 'text-emerald-400' },
  { text: 'this.left = left || null;', indent: 2, color: 'text-emerald-400' },
  { text: 'this.right = right || null;', indent: 2, color: 'text-emerald-400' },
  { text: '}', indent: 1, color: 'text-slate-400' },
  { text: '}', indent: 0, color: 'text-slate-400' },
  { text: '', indent: 0, color: '' },
  { text: 'const maxDepth = (root) => {', indent: 0, color: 'text-blue-400' },
  { text: 'if (!root) return 0;', indent: 1, color: 'text-purple-400' },
  { text: 'return 1 + Math.max(', indent: 1, color: 'text-amber-400' },
  { text: 'maxDepth(root.left),', indent: 2, color: 'text-emerald-400' },
  { text: 'maxDepth(root.right)', indent: 2, color: 'text-emerald-400' },
  { text: ');', indent: 1, color: 'text-slate-400' },
  { text: '};', indent: 0, color: 'text-slate-400' },
];

// ─── Single typing line component ───────────────────────────────
function TypingLine({ line, delay, onComplete }) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (indexRef.current < line.text.length) {
          setDisplayText(line.text.slice(0, indexRef.current + 1));
          indexRef.current++;
        } else {
          clearInterval(interval);
          setShowCursor(false);
          onComplete?.();
        }
      }, 30 + Math.random() * 50); // Variable typing speed

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [line.text, delay]);

  if (!line.text) return <div className="h-5" />;

  const indent = '  '.repeat(line.indent);

  return (
    <div className="flex items-center font-mono text-xs sm:text-sm leading-relaxed whitespace-pre">
      <span className="text-slate-600 dark:text-slate-700 select-none w-8 text-right mr-4 text-[10px]">
        {/* line number placeholder */}
      </span>
      <span className={`${line.color} opacity-70`}>
        {indent}{displayText}
      </span>
      {showCursor && displayText.length > 0 && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[2px] h-4 bg-primary ml-[1px]"
        />
      )}
    </div>
  );
}

// ─── Floating code block component ──────────────────────────────
function FloatingCodeBlock({ lines, startDelay, position, speed }) {
  const [activeLines, setActiveLines] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveLines(1);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [startDelay]);

  const handleLineComplete = () => {
    setActiveLines((prev) => Math.min(prev + 1, lines.length));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: position === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: startDelay / 1000, duration: 0.8 }}
      className={`absolute ${position === 'left' ? 'left-4 sm:left-8' : 'right-4 sm:right-8'} pointer-events-none`}
      style={{ top: `${speed}%` }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {lines.slice(0, activeLines).map((line, i) => (
          <TypingLine
            key={i}
            line={line}
            delay={i * 400}
            onComplete={i === activeLines - 1 ? handleLineComplete : undefined}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Keyboard key press visualization ───────────────────────────
function KeyboardPulse() {
  const [keys, setKeys] = useState([]);
  const idRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSmall = window.matchMedia('(max-width: 768px)').matches;
    if (prefersReducedMotion || isSmall) return;

    const chars = 'abcdefghijklmnopqrstuvwxyz{}()[];=><+-*/'.split('');

    const interval = setInterval(() => {
      const id = idRef.current++;
      const key = {
        id,
        char: chars[Math.floor(Math.random() * chars.length)],
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      };
      setKeys((prev) => [...prev.slice(-6), key]);

      setTimeout(() => {
        setKeys((prev) => prev.filter((k) => k.id !== id));
      }, 1500);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {keys.map((k) => (
        <motion.div
          key={k.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.12, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5, y: -10 }}
          transition={{ duration: 0.8 }}
          className="absolute pointer-events-none font-mono text-primary font-bold"
          style={{
            left: `${k.x}%`,
            top: `${k.y}%`,
            fontSize: `${14 + Math.random() * 12}px`,
            textShadow: '0 0 8px hsla(234, 89%, 60%, 0.4)',
          }}
        >
          {k.char}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

// ─── Main Background Component ──────────────────────────────────
const CodeRainBackground = () => {
  const isSmall = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  if (isSmall) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Keyboard key pulses */}
      <KeyboardPulse />

      {/* Left typing block */}
      <FloatingCodeBlock
        lines={CODE_LINES.slice(0, 11)}
        startDelay={800}
        position="left"
        speed={15}
      />

      {/* Right typing block */}
      <FloatingCodeBlock
        lines={CODE_LINES.slice(12, 19)}
        startDelay={3000}
        position="right"
        speed={25}
      />

      {/* Bottom left block */}
      <FloatingCodeBlock
        lines={CODE_LINES.slice(20, 27)}
        startDelay={6000}
        position="left"
        speed={55}
      />

      {/* Scan lines for CRT effect */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, hsla(234, 89%, 60%, 0.1) 2px, hsla(234, 89%, 60%, 0.1) 4px)',
        }}
      />
    </div>
  );
};

export default CodeRainBackground;
