import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const INTRO_STORAGE_KEY = "prepbridge_intro_shown";
const TOTAL_DURATION_MS = 4200;

const PREP_LETTERS = "Prep".split("");
const BRIDGE_LETTERS = "Bridge".split("");

const createParticles = (count = 26) =>
  Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 2,
    driftX: -8 + Math.random() * 16,
    driftY: 18 + Math.random() * 28,
    duration: 7 + Math.random() * 7,
    delay: Math.random() * 4,
    opacity: 0.2 + Math.random() * 0.14,
  }));

const backgroundBlobs = [
  {
    className:
      "-left-28 -top-20 h-[24rem] w-[24rem] bg-violet-600/12",
    animate: { x: [0, 36, 0], y: [0, 24, 0], scale: [1, 1.08, 1] },
    transition: { duration: 15, repeat: Infinity, ease: "easeInOut" },
  },
  {
    className:
      "right-[-7rem] top-[15%] h-[22rem] w-[22rem] bg-fuchsia-500/10",
    animate: { x: [0, -30, 0], y: [0, -22, 0], scale: [1, 1.05, 1] },
    transition: { duration: 17, repeat: Infinity, ease: "easeInOut" },
  },
  {
    className:
      "bottom-[-8rem] left-[26%] h-[20rem] w-[20rem] bg-cyan-500/8",
    animate: { x: [0, 26, 0], y: [0, -18, 0], scale: [1, 1.06, 1] },
    transition: { duration: 13, repeat: Infinity, ease: "easeInOut" },
  },
];

export default function IntroScreen({ onComplete }) {
  const [shouldPlay] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !window.sessionStorage.getItem(INTRO_STORAGE_KEY);
  });
  const hasCompletedRef = useRef(false);
  const particles = useMemo(() => createParticles(26), []);

  const completeIntro = () => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    onComplete?.();
  };

  useEffect(() => {
    if (typeof window === "undefined" || !shouldPlay) {
      completeIntro();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      completeIntro();
    }, TOTAL_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlay]);

  if (!shouldPlay) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {backgroundBlobs.map((blob, index) => (
        <motion.div
          key={index}
          className={`absolute rounded-full blur-3xl ${blob.className}`}
          animate={blob.animate}
          transition={blob.transition}
        />
      ))}

      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute rounded-full bg-white"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
            }}
            animate={{
              y: [0, -particle.driftY],
              x: [0, particle.driftX],
              opacity: [particle.opacity * 0.45, particle.opacity, particle.opacity * 0.5],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center"
        initial={{ scale: 1, filter: "blur(0px)" }}
        animate={{ scale: 1.03, filter: "blur(4px)" }}
        transition={{ delay: 3.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mb-4"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 230,
            damping: 16,
            mass: 0.8,
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ delay: 0.56, duration: 0.26, ease: "easeInOut" }}
          >
            <Sparkles
              className="h-14 w-14 text-[#7c3aed] md:h-16 md:w-16"
              strokeWidth={2.2}
              style={{ filter: "drop-shadow(0 0 20px rgba(124,58,237,0.85))" }}
            />
          </motion.div>
        </motion.div>

        <div className="flex items-end justify-center text-4xl font-bold tracking-tight md:text-6xl">
          <span className="inline-flex text-white">
            {PREP_LETTERS.map((letter, index) => (
              <motion.span
                key={`prep-${index}-${letter}`}
                className="inline-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.08, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
          <span className="inline-flex bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            {BRIDGE_LETTERS.map((letter, index) => (
              <motion.span
                key={`bridge-${index}-${letter}`}
                className="inline-block"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (PREP_LETTERS.length + index) * 0.08, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>
            ))}
          </span>
          <motion.span
            className="ml-1 inline-block text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{
              delay: 1.56,
              duration: 0.4,
              times: [0, 0.2, 0.45, 0.75, 1],
              ease: "linear",
            }}
          >
            |
          </motion.span>
        </div>

        <motion.p
          className="mt-5 text-base font-light tracking-wide text-gray-400 md:text-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Your AI-Powered Path To Placement
        </motion.p>

        <motion.div
          className="mt-8 flex w-full flex-col items-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.2, ease: "easeOut" }}
        >
          <div className="relative mx-auto h-[2px] w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600 shadow-[0_0_16px_rgba(34,211,238,0.5)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="absolute inset-y-[-2px] left-0 w-16 bg-white/40 blur-[6px]"
              initial={{ x: "-130%", opacity: 0 }}
              animate={{ x: ["-130%", "220%"], opacity: [0, 0.85, 0] }}
              transition={{
                delay: 2.85,
                duration: 0.36,
                ease: "easeInOut",
                repeat: 1,
                repeatType: "loop",
              }}
            />
          </div>

          <motion.p
            className="mt-3 text-xs text-gray-600"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.95, duration: 0.3, ease: "easeOut" }}
          >
            Initializing...
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}