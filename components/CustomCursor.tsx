'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hoveredType, setHoveredType] = useState<'default' | 'link' | 'input' | 'magnetic'>('default');
  const [magneticElement, setMagneticElement] = useState<HTMLElement | null>(null);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 30, stiffness: 350, mass: 0.6 };
  const cursorRingX = useSpring(cursorX, springConfig);
  const cursorRingY = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Enable custom cursor styles in CSS
    document.documentElement.classList.add('custom-cursor-active');

    const moveCursor = (e: MouseEvent) => {
      if (magneticElement) {
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Apply magnetic pull (90% snap, 10% mouse coordinates)
        const pullX = centerX + (e.clientX - centerX) * 0.25;
        const pullY = centerY + (e.clientY - centerY) * 0.25;
        cursorX.set(pullX);
        cursorY.set(pullY);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const closestLink = target.closest('a, button, [role="button"]');
      const closestInput = target.closest('input, textarea, select');
      const closestMagnetic = target.closest('.magnetic-item') as HTMLElement;

      if (closestMagnetic) {
        setHoveredType('magnetic');
        setMagneticElement(closestMagnetic);
      } else if (closestLink) {
        setHoveredType('link');
        setMagneticElement(null);
      } else if (closestInput) {
        setHoveredType('input');
        setMagneticElement(null);
      } else {
        setHoveredType('default');
        setMagneticElement(null);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [magneticElement, visible, cursorX, cursorY]);

  if (!visible) return null;

  const ringVariants = {
    default: {
      width: 24,
      height: 24,
      border: '1px solid rgba(255, 255, 255, 0.24)',
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    link: {
      width: 48,
      height: 48,
      border: '1px solid rgba(255, 255, 255, 0.45)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    input: {
      width: 12,
      height: 32,
      border: '1px solid rgba(255, 255, 255, 0.55)',
      backgroundColor: 'transparent',
      borderRadius: 2,
    },
    magnetic: {
      width: 60,
      height: 60,
      border: '2px solid rgba(255, 255, 255, 0.75)',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    }
  };

  const dotVariants = {
    default: { scale: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' },
    link: { scale: 0, backgroundColor: 'rgba(255, 255, 255, 0)' },
    input: { scale: 0, backgroundColor: 'rgba(255, 255, 255, 0)' },
    magnetic: { scale: 2, backgroundColor: '#06b6d4' } // react-cyan glow
  };

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        style={{
          x: cursorRingX,
          y: cursorRingY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={hoveredType}
        variants={ringVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      />
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={hoveredType}
        variants={dotVariants}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
