import { useEffect, useMemo, useRef, useState } from "react";
import { motion, motionValue, useMotionValue, useSpring } from "framer-motion";

const OUTER_SIZE = 40;
const INNER_SIZE = 6;
const TRAIL_COUNT = 8;

const clickableSelector = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "[role='button']",
  "[data-cursor='pointer']",
].join(",");

const supportsEventListener = (mediaQueryList) => typeof mediaQueryList.addEventListener === "function";

const CustomCursor = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(-120);
  const mouseY = useMotionValue(-120);

  const outerX = useSpring(mouseX, { stiffness: 150, damping: 15, mass: 0.18 });
  const outerY = useSpring(mouseY, { stiffness: 150, damping: 15, mass: 0.18 });

  const trailDots = useMemo(
    () =>
      Array.from({ length: TRAIL_COUNT }, () => ({
        x: motionValue(-120),
        y: motionValue(-120),
      })),
    [],
  );

  const rafRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const pointerMedia = window.matchMedia("(pointer: coarse)");
    const updatePointerType = () => setIsTouchDevice(pointerMedia.matches);

    updatePointerType();

    if (supportsEventListener(pointerMedia)) {
      pointerMedia.addEventListener("change", updatePointerType);
      return () => pointerMedia.removeEventListener("change", updatePointerType);
    }

    pointerMedia.addListener(updatePointerType);
    return () => pointerMedia.removeListener(updatePointerType);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isTouchDevice) return undefined;

    const handleMove = (event) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    const handleOver = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      setIsInteractive(Boolean(target.closest(clickableSelector)));
    };

    const handleOut = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (!target.closest(clickableSelector)) {
        setIsInteractive(false);
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isTouchDevice, isVisible, mouseX, mouseY]);

  useEffect(() => {
    if (isTouchDevice) return undefined;

    const animateTrail = () => {
      let previousX = mouseX.get();
      let previousY = mouseY.get();

      trailDots.forEach((dot, index) => {
        const followStrength = Math.max(0.12, 0.34 - index * 0.03);
        const nextX = dot.x.get() + (previousX - dot.x.get()) * followStrength;
        const nextY = dot.y.get() + (previousY - dot.y.get()) * followStrength;

        dot.x.set(nextX);
        dot.y.set(nextY);

        previousX = nextX;
        previousY = nextY;
      });

      rafRef.current = window.requestAnimationFrame(animateTrail);
    };

    rafRef.current = window.requestAnimationFrame(animateTrail);

    return () => {
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [isTouchDevice, mouseX, mouseY, trailDots]);

  if (isTouchDevice) {
    return null;
  }

  const outerScale = isClicking ? 0.8 : isInteractive ? 1.5 : 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]">
      {trailDots.map((dot, index) => {
        const opacity = 0.6 - index * ((0.6 - 0.05) / (TRAIL_COUNT - 1));
        const size = Math.max(1.5, 3 - index * 0.2);

        return (
          <motion.div
            key={`trail-${index}`}
            className="absolute rounded-full bg-violet-400"
            style={{
              x: dot.x,
              y: dot.y,
              width: size,
              height: size,
              opacity: isVisible ? opacity : 0,
              translateX: "-50%",
              translateY: "-50%",
            }}
          />
        );
      })}

      <motion.div
        className="absolute rounded-full border-2 border-violet-500"
        style={{
          x: outerX,
          y: outerY,
          width: OUTER_SIZE,
          height: OUTER_SIZE,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: outerScale,
          opacity: isVisible ? 0.6 : 0,
          backgroundColor: isInteractive ? "rgba(124,58,237,0.10)" : "rgba(124,58,237,0)",
        }}
        transition={
          isClicking
            ? { duration: 0.05, ease: "linear" }
            : { type: "spring", stiffness: 230, damping: 18, mass: 0.28 }
        }
      />

      <motion.div
        className="absolute rounded-full bg-white"
        style={{
          x: mouseX,
          y: mouseY,
          width: INNER_SIZE,
          height: INNER_SIZE,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isClicking ? 0 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={
          isClicking
            ? { duration: 0.05, ease: "linear" }
            : { type: "spring", stiffness: 300, damping: 22, mass: 0.24 }
        }
      />
    </div>
  );
};

export default CustomCursor;
