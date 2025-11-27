import { ReactNode, useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface SwipeablePagesProps {
  children: ReactNode;
}

// Define the order of main pages for swipe navigation
const MAIN_PAGES = ["/", "/pay", "/account"];
const PAGE_LABELS = ["HOME", "PAY", "ACCOUNT"];

export const SwipeablePages = ({ children }: SwipeablePagesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSoundEffects();
  const [isDragging, setIsDragging] = useState(false);

  const currentIndex = MAIN_PAGES.indexOf(location.pathname);
  const isSwipeEnabled = currentIndex !== -1;

  // Motion values for drag
  const x = useMotionValue(0);
  
  // Transform for visual feedback
  const scale = useTransform(x, [-200, 0, 200], [0.95, 1, 0.95]);
  const rotate = useTransform(x, [-200, 0, 200], [-3, 0, 3]);
  const opacity = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

  // Indicator transforms
  const indicatorX = useTransform(x, [-200, 0, 200], [30, 0, -30]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Swipe left (next page)
    if ((offset < -threshold || velocity < -500) && currentIndex < MAIN_PAGES.length - 1) {
      play('navigate');
      navigate(MAIN_PAGES[currentIndex + 1]);
    }
    // Swipe right (previous page)
    else if ((offset > threshold || velocity > 500) && currentIndex > 0) {
      play('navigate');
      navigate(MAIN_PAGES[currentIndex - 1]);
    }
  };

  // Reset x position on route change
  useEffect(() => {
    x.set(0);
  }, [location.pathname, x]);

  if (!isSwipeEnabled) {
    return <>{children}</>;
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < MAIN_PAGES.length - 1;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Page indicator dots */}
      <motion.div 
        className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-full border border-sw-blue/20"
        style={{ x: indicatorX }}
      >
        {MAIN_PAGES.map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex 
                ? 'bg-sw-blue w-6' 
                : 'bg-sw-blue/30'
            }`}
          />
        ))}
      </motion.div>

      {/* Edge indicators when dragging */}
      <AnimatePresence>
        {isDragging && hasPrev && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
          >
            <div className="flex items-center gap-2 text-sw-blue/60">
              <div className="w-8 h-8 rounded-full border border-sw-blue/40 flex items-center justify-center">
                <span className="text-lg">←</span>
              </div>
              <span className="font-mono text-xs tracking-wider">{PAGE_LABELS[currentIndex - 1]}</span>
            </div>
          </motion.div>
        )}
        {isDragging && hasNext && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
          >
            <div className="flex items-center gap-2 text-sw-blue/60">
              <span className="font-mono text-xs tracking-wider">{PAGE_LABELS[currentIndex + 1]}</span>
              <div className="w-8 h-8 rounded-full border border-sw-blue/40 flex items-center justify-center">
                <span className="text-lg">→</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main draggable page */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, scale, rotate, opacity }}
        className="min-h-screen touch-pan-y"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>

      {/* Subtle glow effect on edges when dragging */}
      <AnimatePresence>
        {isDragging && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-y-0 left-0 w-20 pointer-events-none z-30"
              style={{
                background: 'linear-gradient(to right, hsl(var(--sw-blue) / 0.1), transparent)',
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-y-0 right-0 w-20 pointer-events-none z-30"
              style={{
                background: 'linear-gradient(to left, hsl(var(--sw-blue) / 0.1), transparent)',
              }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
