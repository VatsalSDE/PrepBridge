import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Circle,
  Github,
  Menu,
  Minus,
  Square,
  Twitter,
  X,
} from "lucide-react";

const transitionEase = [0.33, 1, 0.68, 1];
const sectionViewport = { once: true, margin: "-100px" };

const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: transitionEase },
  },
};

const terminalContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const terminalLineVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.24, ease: transitionEase },
  },
};

const problemItemVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: transitionEase },
  },
};

const timelineItemVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: transitionEase },
  },
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Community", href: "#community" },
];

const heroWords = ["Placement", "prep,", "finally", "structured."];

const stats = [
  { value: 10000, suffix: "+", label: "Students" },
  { value: 500, suffix: "+", label: "Companies" },
  { value: 50, suffix: "+", label: "Colleges" },
  { value: 95, suffix: "%", label: "Success" },
];

const problemItems = [
  {
    number: "01",
    title: "No study priority",
    description: "You do not know what to study first, what to skip, or what actually matters.",
  },
  {
    number: "02",
    title: "No consistency system",
    description: "Without daily tracking, prep feels productive but achieves nothing.",
  },
  {
    number: "03",
    title: "Scattered resources",
    description: "DSA here, aptitude there, mock tests somewhere else. No single source of truth.",
  },
  {
    number: "04",
    title: "Generic preparation",
    description: "Everyone preps the same way regardless of which company or role they are targeting.",
  },
  {
    number: "05",
    title: "Lost alumni intelligence",
    description: "Seniors' interview experiences exist in WhatsApp groups and forgotten notes.",
  },
];

const timelineSteps = [
  {
    number: "01",
    title: "Set goals",
    description: "Define your role target and timeline.",
  },
  {
    number: "02",
    title: "Follow roadmap",
    description: "Execute curated daily tracks.",
  },
  {
    number: "03",
    title: "Match with JDs",
    description: "Measure your profile against real hiring requirements.",
  },
  {
    number: "04",
    title: "Get placed",
    description: "Fix gaps with clear feedback loops.",
  },
];

const heroTerminalLines = [
  {
    type: "text",
    className: "text-gray-600",
    content: "$ prepbridge analyze --resume ./vatsal_resume.pdf",
  },
  { type: "blank" },
  {
    type: "text",
    className: "text-violet-400",
    content: "* Analyzing JD for Google SWE Role...",
  },
  {
    type: "progress",
    className: "text-gray-500",
    label: "  Extracting skills from JD...",
  },
  {
    type: "progress",
    className: "text-gray-500",
    label: "  Parsing resume...",
  },
  {
    type: "progress",
    className: "text-gray-500",
    label: "  Running AI match engine...",
  },
  { type: "blank" },
  {
    type: "text",
    className: "font-semibold text-white",
    content: "  ANALYSIS COMPLETE",
  },
  { type: "blank" },
  {
    type: "text",
    className: "text-emerald-400",
    content: "  + Match Score              72 / 100",
  },
  {
    type: "text",
    className: "text-emerald-400",
    content: "  + Matched Skills           8 skills found",
  },
  {
    type: "text",
    className: "text-red-400",
    content: "  - Missing Skills           3 gaps identified",
  },
  { type: "blank" },
  {
    type: "text",
    className: "text-gray-500",
    content: "  Critical gaps:",
  },
  {
    type: "text",
    className: "text-amber-300",
    content: "  -> Docker          [required]    priority: HIGH",
  },
  {
    type: "text",
    className: "text-amber-300",
    content: "  -> Redis           [preferred]   priority: MEDIUM",
  },
  {
    type: "text",
    className: "text-amber-300",
    content: "  -> System Design   [required]    priority: HIGH",
  },
  { type: "blank" },
  {
    type: "text",
    className: "text-gray-600",
    content: "  Estimated prep time: 4-6 weeks",
  },
  {
    type: "command",
    className: "text-violet-400",
    content: "  Run prepbridge roadmap --fill-gaps to start >",
  },
];

const noiseTexture =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")";

function CountUpValue({ target, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, sectionViewport);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return undefined;

    const controls = animate(0, target, {
      duration: 1.1,
      ease: transitionEase,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [isInView, target]);

  return (
    <span ref={ref} className="text-3xl font-bold text-white">
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

function TerminalCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 2 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={sectionViewport}
      transition={{ duration: 0.65, ease: transitionEase }}
      style={{ transformPerspective: 1200, boxShadow: "0 0 80px rgba(124,58,237,0.15)" }}
      className="mx-auto mt-20 w-full max-w-2xl"
    >
      <div className="flex h-9 items-center justify-between rounded-t-xl border border-white/[0.08] bg-[#111111] px-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28ca41]" />
        </div>
        <p className="font-mono text-xs text-gray-600">prepbridge - jd-analysis</p>
        <div className="flex items-center gap-2 text-gray-700">
          <Minus className="h-3.5 w-3.5" />
          <Square className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="rounded-b-xl border-x border-b border-white/[0.08] bg-[#0d0d0d] p-6 font-mono text-sm leading-[1.8]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={terminalContainerVariants}
          className="space-y-0.5"
        >
          {heroTerminalLines.map((line, index) => {
            if (line.type === "blank") {
              return (
                <motion.p key={`blank-${index}`} variants={terminalLineVariants} className="h-4">
                  <span className="opacity-0">.</span>
                </motion.p>
              );
            }

            if (line.type === "progress") {
              return (
                <motion.div key={`progress-${index}`} variants={terminalLineVariants} className={`flex items-center gap-3 ${line.className}`}>
                  <span className="whitespace-pre">{line.label}</span>
                  <div className="h-[9px] w-24 overflow-hidden rounded-sm border border-white/10 bg-black/40">
                    <motion.div
                      className="h-full"
                      initial={{ width: "0%", backgroundColor: "#7c3aed" }}
                      whileInView={{ width: "100%", backgroundColor: "#22c55e" }}
                      viewport={sectionViewport}
                      transition={{ duration: 0.7, delay: 0.12 + index * 0.03, ease: transitionEase }}
                    />
                  </div>
                  <span className="text-emerald-400">done</span>
                </motion.div>
              );
            }

            if (line.type === "command") {
              return (
                <motion.p key={`line-${index}`} variants={terminalLineVariants} className={line.className}>
                  {line.content}
                  <motion.span
                    className="ml-1 inline-block h-4 w-[7px] bg-violet-400 align-middle"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                  />
                </motion.p>
              );
            }

            return (
              <motion.p key={`line-${index}`} variants={terminalLineVariants} className={`${line.className} whitespace-pre`}>
                {line.content}
              </motion.p>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("cursor-none");
    html.style.cursor = "";

    return () => {
      html.classList.remove("cursor-none");
      html.style.cursor = "";
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#0a0a0a] text-white">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ backgroundImage: noiseTexture, opacity: 0.03 }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.45) 70%, transparent 100%)",
          }}
        />

        <div className="absolute left-1/2 top-[-220px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-500/12 blur-[120px]" />
      </div>

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: transitionEase }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "border-white/[0.06] bg-black/60 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[4px] bg-violet-500" />
            <span className="text-lg tracking-tight">
              <span className="font-semibold text-white">Prep</span>
              <span className="font-semibold text-violet-400">Bridge</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-gray-400 transition-colors duration-150 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              to="/signup"
              className="rounded-md border border-white/20 bg-white/[0.05] px-4 py-1.5 text-sm text-white transition-all duration-150 hover:border-violet-500 hover:bg-violet-500/10 hover:text-violet-300"
            >
              Get started
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            className="rounded-md border border-white/15 p-2 text-gray-300 md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/[0.06] bg-black/85 px-6 py-4 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm text-gray-300 transition-colors duration-150 hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-2 inline-flex w-fit rounded-md border border-white/20 bg-white/[0.05] px-4 py-1.5 text-sm text-white"
                >
                  Get started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main className="relative z-10">
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={sectionVariants}
          className="px-6 pb-24 pt-[180px] md:pb-32"
        >
          <motion.div className="mx-auto w-full max-w-6xl text-center" variants={staggerContainer}>
            <motion.div
              variants={itemVariants}
              whileHover={{ borderColor: "rgba(139,92,246,0.5)" }}
              transition={{ duration: 0.2 }}
              className="relative mx-auto inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs"
            >
              <motion.span
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: "-120%" }}
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 0.2, ease: "linear" }}
              />
              <span className="relative h-1.5 w-1.5 rounded-full bg-violet-400">
                <motion.span
                  className="absolute inset-0 rounded-full bg-violet-400"
                  animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              </span>
              <span className="relative text-gray-200">AI-powered JD matching is live</span>
              <span className="relative text-violet-400">See how -&gt;</span>
            </motion.div>

            <motion.h1 className="mx-auto mt-10 max-w-6xl text-[56px] font-black leading-[0.95] tracking-tighter sm:text-[80px] md:text-[100px] lg:text-[120px]">
              <div>
                {heroWords.slice(0, 2).map((word, index) => (
                  <motion.span
                    key={word}
                    className="mr-4 inline-block"
                    initial={{ clipPath: "inset(0 0 100% 0)", y: 40, opacity: 0 }}
                    whileInView={{ clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 }}
                    viewport={sectionViewport}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: transitionEase }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
              <div className="relative mt-2 inline-block">
                {heroWords.slice(2).map((word, index) => (
                  <motion.span
                    key={word}
                    className="mr-4 inline-block last:mr-0"
                    initial={{ clipPath: "inset(0 0 100% 0)", y: 40, opacity: 0 }}
                    whileInView={{ clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1 }}
                    viewport={sectionViewport}
                    transition={{ duration: 0.5, delay: 0.26 + index * 0.08, ease: transitionEase }}
                  >
                    {word}
                  </motion.span>
                ))}

                <motion.span
                  className="absolute -bottom-3 left-0 h-[2px] w-full bg-violet-500"
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1, originX: 0 }}
                  viewport={sectionViewport}
                  transition={{ duration: 0.45, delay: 0.78, ease: transitionEase }}
                />
              </div>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mx-auto mt-8 max-w-lg text-lg leading-relaxed text-gray-500"
            >
              PrepBridge turns chaotic placement prep into a measurable system. Plan, execute, and align with real
              market demand - all in one place.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }}>
                <Link
                  to="/signup"
                  className="group relative inline-flex overflow-hidden rounded-md bg-white px-6 py-3 font-semibold text-black transition-shadow duration-150 hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                  <motion.span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                    initial={{ x: "-140%" }}
                    animate={{ x: ["-140%", "140%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="relative">Start for free</span>
                </Link>
              </motion.div>

              <motion.a
                href="#features"
                className="group inline-flex items-center gap-1 text-gray-400 transition-colors duration-150 hover:text-white"
              >
                Read the docs
                <motion.span
                  animate={{ x: 0 }}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  className="inline-flex"
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </motion.a>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-600">
              <div className="flex -space-x-2">
                {[
                  { initials: "AD", color: "bg-violet-500" },
                  { initials: "NT", color: "bg-blue-500" },
                  { initials: "VI", color: "bg-emerald-500" },
                  { initials: "II", color: "bg-orange-500" },
                ].map((avatar) => (
                  <span
                    key={avatar.initials}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border border-[#0a0a0a] text-[10px] font-semibold text-white ${avatar.color}`}
                  >
                    {avatar.initials}
                  </span>
                ))}
              </div>
              <p>Used by students from IIT Delhi, NIT Trichy, VIT and 200+ others</p>
            </motion.div>

            <TerminalCard />
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={sectionVariants}
          className="border-y border-white/[0.06] px-6 py-12"
        >
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-y-0">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={`flex flex-col items-center px-4 text-center ${
                  index < 2 ? "border-b border-white/[0.06] pb-6 md:border-b-0 md:pb-0" : ""
                } ${index % 2 === 0 ? "border-r border-white/[0.06] md:border-r-0" : ""} ${
                  index !== stats.length - 1 ? "md:border-r md:border-white/[0.06]" : ""
                }`}
              >
                <CountUpValue target={stat.value} suffix={stat.suffix} />
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={sectionVariants}
          className="px-6 py-28 md:py-36"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-14 md:grid-cols-[0.9fr_1.1fr]">
            <motion.div variants={itemVariants} className="md:sticky md:top-32 md:self-start">
              <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
                The problem
                <br />
                with placement prep.
              </h2>
              <p className="mt-4 max-w-xs text-base text-gray-500">
                Most students spend months preparing without a system, a direction, or a way to measure progress.
                PrepBridge fixes this.
              </p>
            </motion.div>

            <motion.div variants={staggerContainer}>
              {problemItems.map((item) => (
                <motion.article
                  key={item.number}
                  variants={problemItemVariants}
                  className="group border-t border-white/[0.06] py-8 pl-0 transition-all duration-150 hover:border-l hover:border-l-violet-500/50 hover:pl-3"
                >
                  <div className="grid gap-4 md:grid-cols-[90px_1fr]">
                    <p className="text-5xl font-black text-gray-800 transition-colors duration-150 group-hover:text-violet-500">
                      {item.number}
                    </p>
                    <div>
                      <h3 className="text-lg font-semibold text-white transition-colors duration-150 group-hover:text-white/95">
                        {item.title}
                      </h3>
                      <p className="mt-1 max-w-md text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={sectionVariants}
          className="px-6 py-28 md:py-36"
        >
          <motion.div className="mx-auto w-full max-w-6xl" variants={staggerContainer}>
            <motion.h2 variants={itemVariants} className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Built for serious prep.
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-base text-gray-500">
              Every surface is designed to make prep focused, measurable, and market-aligned.
            </motion.p>

            <motion.div variants={staggerContainer} className="mt-14 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <motion.article
                variants={itemVariants}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111111] xl:col-span-2"
              >
                <h3 className="text-xl font-semibold text-white">AI JD Matching</h3>
                <p className="mt-1 text-sm text-gray-500">Upload resume. Get exact skill gaps.</p>
                <div className="mt-5 rounded-lg border border-white/[0.08] bg-black/30 p-4 font-mono text-xs text-white/75">
                  <motion.p initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={sectionViewport} transition={{ delay: 0.1 }}>
                    $ prepbridge analyze --role swe
                  </motion.p>
                  <motion.p initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={sectionViewport} transition={{ delay: 0.22 }}>
                    match_score: 72
                  </motion.p>
                  <motion.p initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={sectionViewport} transition={{ delay: 0.34 }}>
                    missing: Docker, Redis, System Design
                  </motion.p>
                  <motion.p initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={sectionViewport} transition={{ delay: 0.46 }}>
                    next_step: roadmap --fill-gaps
                  </motion.p>
                </div>
                <span className="mt-4 inline-flex rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-300">
                  AI Powered
                </span>
              </motion.article>

              <motion.article
                variants={itemVariants}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111111]"
              >
                <h3 className="text-xl font-semibold text-white">Daily Planner</h3>
                <p className="mt-1 text-sm text-gray-500">Stay focused with high-friction execution loops.</p>
                <ul className="mt-5 space-y-3 text-sm">
                  <li className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Solve 3 LeetCode mediums
                    </span>
                    <span className="text-xs text-emerald-500">done</span>
                  </li>
                  <li className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Revise OS concepts
                    </span>
                    <span className="text-xs text-emerald-500">done</span>
                  </li>
                  <li className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-2">
                      <Circle className="h-4 w-4" /> Mock interview practice
                    </span>
                    <span className="text-xs text-gray-500">pending</span>
                  </li>
                  <li className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-2">
                      <Circle className="h-4 w-4" /> System design reading
                    </span>
                    <span className="text-xs text-gray-500">pending</span>
                  </li>
                </ul>
              </motion.article>

              <motion.article
                variants={itemVariants}
                initial="rest"
                whileHover="hover"
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111111]"
              >
                <h3 className="text-xl font-semibold text-white">Smart Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">Track momentum in one glance.</p>
                <div className="mt-7 flex h-28 items-end justify-between gap-3">
                  {[
                    { label: "DSA", value: 72 },
                    { label: "CoreCS", value: 45 },
                    { label: "Apt", value: 60 },
                  ].map((bar) => (
                    <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-24 w-full items-end rounded-md border border-white/10 p-1">
                        <motion.div
                          className="w-full rounded-sm bg-violet-500"
                          variants={{
                            rest: { height: `${Math.max(12, bar.value * 0.78)}%` },
                            hover: { height: `${bar.value}%` },
                          }}
                          transition={{ duration: 0.25, ease: transitionEase }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article
                variants={itemVariants}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111111]"
              >
                <h3 className="text-xl font-semibold text-white">Roadmap System</h3>
                <p className="mt-1 text-sm text-gray-500">See exactly what to tackle next.</p>
                <div className="mt-6 space-y-4 font-mono text-xs text-gray-300">
                  {[
                    { label: "DSA Fundamentals", value: 80 },
                    { label: "Core CS", value: 50 },
                    { label: "System Design", value: 30 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <span>{item.value}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-sm border border-white/[0.1] bg-black/40">
                        <div className="h-full bg-violet-500" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.article>

              <motion.article
                variants={itemVariants}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111111]"
              >
                <h3 className="text-xl font-semibold text-white">Alumni Guidelines</h3>
                <p className="mt-1 text-sm text-gray-500">Learn from recently placed seniors.</p>
                <div className="mt-6 rounded-lg border border-white/[0.08] bg-black/20 p-4">
                  <p className="text-4xl leading-none text-gray-800">"</p>
                  <p className="mt-1 italic text-gray-300">
                    Google asked me to implement LRU Cache from scratch. Focus on system design basics first.
                  </p>
                  <p className="mt-4 text-xs text-gray-500">- Anonymous, Google SWE 2024</p>
                </div>
              </motion.article>

              <motion.article
                id="community"
                variants={itemVariants}
                className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f0f] p-6 transition-all duration-200 hover:border-white/[0.12] hover:bg-[#111111] xl:col-span-2"
              >
                <h3 className="text-xl font-semibold text-white">Anonymous Community</h3>
                <p className="mt-1 text-sm text-gray-500">Real social energy, zero identity pressure.</p>

                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-300">CuriousOwl42</span>
                      <span>2h ago</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">
                      Anyone else finding DP on trees harder than regular DP? Tips?
                    </p>
                    <p className="mt-3 text-xs text-gray-500">up 24   comments 8</p>
                  </div>

                  <div className="rounded-lg border border-white/[0.08] bg-black/20 p-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium text-gray-300">SilentCoder99</span>
                      <span>5h ago</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">
                      Just got placed at Microsoft! The alumni guidelines here helped so much.
                    </p>
                    <p className="mt-3 text-xs text-gray-500">up 156   comments 23</p>
                  </div>
                </div>
              </motion.article>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          id="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={sectionVariants}
          className="px-6 py-28 md:py-36"
        >
          <motion.div className="mx-auto w-full max-w-6xl" variants={staggerContainer}>
            <motion.h2 variants={itemVariants} className="text-4xl font-black tracking-tight text-white md:text-5xl">
              From zero to placed.
            </motion.h2>

            <div className="relative mt-14">
              <div className="absolute left-0 right-0 top-8 hidden h-px bg-white/10 md:block">
                <motion.div
                  className="absolute left-0 top-0 h-px w-1/4 bg-violet-500"
                  initial={{ x: "-120%" }}
                  whileInView={{ x: "420%" }}
                  viewport={sectionViewport}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>

              <motion.div className="grid gap-8 md:grid-cols-4" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.2 } } }}>
                {timelineSteps.map((step) => (
                  <motion.div key={step.number} variants={timelineItemVariants} className="relative pl-8 md:pl-0">
                    <span className="absolute left-0 top-7 h-px w-6 bg-white/10 md:hidden" />
                    <p className="text-5xl font-black text-violet-500">{step.number}</p>
                    <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-sm text-gray-500">{step.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
          variants={sectionVariants}
          className="relative overflow-hidden px-6 py-32 md:py-40"
        >
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: noiseTexture, opacity: 0.03 }} />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[720px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[160px]" />

          <motion.div className="relative mx-auto flex w-full max-w-5xl flex-col items-center text-center" variants={staggerContainer}>
            <motion.h2 variants={itemVariants} className="text-5xl font-black leading-[0.95] tracking-tighter text-white md:text-7xl">
              Start preparing
              <br />
              smarter today.
            </motion.h2>
            <motion.p variants={itemVariants} className="mt-4 text-base text-gray-500">
              Free for students. No credit card. No limits.
            </motion.p>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15 }} className="mt-10">
              <Link
                to="/signup"
                className="group relative inline-flex overflow-hidden rounded-md bg-white px-8 py-4 text-base font-semibold text-black transition-all duration-300 hover:bg-violet-600 hover:text-white hover:shadow-[0_0_40px_rgba(124,58,237,0.4)]"
                style={{ boxShadow: "0 0 0 rgba(124,58,237,0)" }}
              >
                <motion.span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/65 to-transparent"
                  initial={{ x: "-120%" }}
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{ duration: 2.3, repeat: Infinity, ease: "linear" }}
                />
                <span className="relative">Start for free</span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
      </main>

      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={sectionViewport}
        variants={sectionVariants}
        className="relative z-10 border-t border-white/[0.06] px-6 py-12"
      >
        <motion.div className="mx-auto w-full max-w-6xl" variants={staggerContainer}>
          <motion.div variants={itemVariants} className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-semibold text-white">PrepBridge</p>
              <p className="mt-1 text-sm text-gray-600">Built for tier-2 and tier-3 college students.</p>
            </div>

            <div className="flex items-center gap-4">
              <motion.a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className="text-gray-600 transition-colors duration-150 hover:text-white"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </motion.a>
              <motion.a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                whileHover={{ y: -1 }}
                transition={{ duration: 0.15 }}
                className="text-gray-600 transition-colors duration-150 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="mt-8 text-center text-xs text-gray-700">
            (c) 2025 PrepBridge. Made with {"<3"} for students.
          </motion.p>
        </motion.div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
