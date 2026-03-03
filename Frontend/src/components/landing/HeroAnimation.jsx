import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Flame, TrendingUp, Target, Zap } from 'lucide-react';

const floatAnimation = (delay = 0) => ({
    y: [0, -12, 0],
    transition: {
        duration: 3 + delay * 0.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
    },
});

const ProgressBar = ({ label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8 + delay * 0.15, duration: 0.5 }}
        className="space-y-1.5"
    >
        <div className="flex justify-between text-xs">
            <span className="text-foreground/70 font-medium">{label}</span>
            <span className="text-foreground/50">{value}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ delay: 1.2 + delay * 0.2, duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${color}`}
            />
        </div>
    </motion.div>
);

const HeroAnimation = () => {
    const containerRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { stiffness: 100, damping: 30, mass: 0.5 };
    const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), springConfig);
    const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), springConfig);

    const handleMouseMove = (e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    return (
        <motion.div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-lg mx-auto hidden md:block"
            style={{ perspective: 1000 }}
        >
            <motion.div
                style={{ rotateX, rotateY }}
                className="relative w-full aspect-square"
            >
                {/* Glow backdrop */}
                <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent rounded-full blur-3xl" />

                {/* Main Dashboard Card */}
                <motion.div
                    animate={floatAnimation(0)}
                    className="absolute top-[10%] left-[5%] right-[5%] p-5 rounded-2xl bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-border/50 shadow-elevated"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Today's Progress</p>
                                <p className="text-lg font-bold text-foreground">87%</p>
                            </div>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-2.5 py-1 rounded-full bg-success/10 border border-success/20"
                        >
                            <span className="text-xs font-semibold text-success">+12%</span>
                        </motion.div>
                    </div>
                    <ProgressBar label="DSA" value={78} color="bg-primary" delay={0} />
                    <div className="mt-2" />
                    <ProgressBar label="System Design" value={45} color="bg-accent" delay={1} />
                    <div className="mt-2" />
                    <ProgressBar label="Core CS" value={62} color="bg-success" delay={2} />
                </motion.div>

                {/* Streak Card */}
                <motion.div
                    animate={floatAnimation(0.8)}
                    className="absolute bottom-[15%] left-[0%] p-4 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-streak/20 shadow-lg"
                >
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1.05, 1.1, 1],
                                rotate: [0, -5, 5, -3, 0],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-streak to-warning flex items-center justify-center shadow-streak-glow"
                        >
                            <Flame className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                            <p className="text-xs text-muted-foreground">Current Streak</p>
                            <p className="text-xl font-bold text-foreground">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                >
                                    24
                                </motion.span>
                                {' '}
                                <span className="text-sm font-normal text-muted-foreground">days</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* JD Match Card */}
                <motion.div
                    animate={floatAnimation(1.5)}
                    className="absolute bottom-[12%] right-[0%] p-4 rounded-xl bg-card/80 dark:bg-card/60 backdrop-blur-xl border border-primary/20 shadow-lg"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/30" />
                                <motion.circle
                                    cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
                                    strokeLinecap="round"
                                    className="text-primary"
                                    stroke="currentColor"
                                    strokeDasharray="94.2"
                                    initial={{ strokeDashoffset: 94.2 }}
                                    animate={{ strokeDashoffset: 94.2 * (1 - 0.72) }}
                                    transition={{ delay: 1.8, duration: 1.5, ease: 'easeOut' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Target className="w-4 h-4 text-primary" />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">JD Match</p>
                            <p className="text-lg font-bold text-foreground">72%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Action Pill */}
                <motion.div
                    animate={floatAnimation(2)}
                    className="absolute top-[5%] right-[0%] px-3 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-md"
                >
                    <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-foreground/80">5 tasks left</span>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default HeroAnimation;
