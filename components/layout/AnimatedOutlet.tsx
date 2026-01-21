import React from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';


const AnimatedOutlet: React.FC = () => {
  const location = useLocation();
  const element = useOutlet();

  return (
    // mode="wait" ensures the old page leaves before the new one enters.
    // This prevents scrollbar fighting and layout shifts.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="h-full w-full"
        initial={{ opacity: 0, y: 10 }} // Start slightly down and transparent
        animate={{ opacity: 1, y: 0 }}  // Slide up and fade in
        exit={{ opacity: 0, y: -10 }}   // Slide up and fade out
        transition={{ duration: 0.2, ease: "easeOut" }} // Fast, native-like snap
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedOutlet;