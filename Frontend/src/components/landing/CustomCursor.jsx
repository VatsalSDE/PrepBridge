import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

// Particle trail system
function useTrailParticles(x, y) {
  const [particles, setParticles] = useState([]);
  const lastPos = useRef({ x: 0, y: 0 });
  const idRef = useRef(0);

  useEffect(() => {
    const unsub = x.on('change', (latestX) => {
      const latestY = y.get();
      const dx = latestX - lastPos.current.x;
      const dy = latestY - lastPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 8) {
        lastPos.current = { x: latestX, y: latestY };
        const id = idRef.current++;
        setParticles((prev) => [
          ...prev.slice(-12),
          {
            id,
            x: latestX,
            y: latestY,
            size: 4 + Math.random() * 6,
            life: 600 + Math.random() * 400,
          },
        ]);

        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 800);
      }
    });
    return unsub;
  }, [x, y]);

  return particles;
}

const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 250, damping: 22, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const particles = useTrailParticles(cursorX, cursorY);

  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handlePointerCheck = (e) => {
      const target = e.target;
      const isClickable =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsPointer(isClickable);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handlePointerCheck);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handlePointerCheck);
    };
  }, [isVisible]);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      <style>{`
        .landing-custom-cursor,
        .landing-custom-cursor * {
          cursor: none !important;
        }
      `}</style>

      {/* Flame trail particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 0.2, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed pointer-events-none z-[9997]"
            style={{
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
            }}
          >
            <div
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle, hsla(25, 95%, 60%, 0.9), hsla(38, 92%, 55%, 0.6), hsla(0, 80%, 50%, 0.3), transparent)`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Outer flame glow */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 0.7 : 0,
          scale: isPointer ? 2 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <div
          className="w-10 h-10 rounded-full"
          style={{
            background: 'radial-gradient(circle, hsla(25, 95%, 55%, 0.5), hsla(38, 92%, 50%, 0.3), transparent 70%)',
            filter: 'blur(4px)',
          }}
        />
      </motion.div>

      {/* Inner cursor core */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isPointer ? 1.8 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          className={`rounded-full ${
            isPointer
              ? 'w-6 h-6'
              : 'w-4 h-4'
          }`}
          style={{
            background: isPointer
              ? 'radial-gradient(circle, hsla(25, 95%, 60%, 0.6), hsla(38, 92%, 55%, 0.3), transparent 70%)'
              : 'radial-gradient(circle, hsla(25, 95%, 65%, 1), hsla(38, 92%, 55%, 0.8), hsla(0, 80%, 50%, 0.4))',
            boxShadow: '0 0 12px 4px hsla(25, 95%, 55%, 0.5), 0 0 24px 8px hsla(38, 92%, 50%, 0.3)',
          }}
        />
      </motion.div>

      {/* Flickering flame spike above cursor */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-110%',
        }}
        animate={{
          opacity: isVisible ? [0.6, 0.9, 0.5, 0.8] : 0,
          scaleY: isPointer ? [0.8, 1.2, 0.9] : [1, 1.4, 0.8, 1.2],
          scaleX: [0.8, 1, 0.9],
        }}
        transition={{
          duration: 0.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div
          className="w-3 h-5 rounded-full"
          style={{
            background: 'linear-gradient(to top, hsla(25, 95%, 60%, 0.9), hsla(38, 92%, 55%, 0.6), hsla(45, 100%, 70%, 0.2), transparent)',
            filter: 'blur(1px)',
          }}
        />
      </motion.div>
    </>
  );
};

export default CustomCursor;
