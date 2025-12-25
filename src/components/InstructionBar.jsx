import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const InstructionBar = ({ instruction, tip, accentColor = 'sky' }) => {
  const colorClasses = {
    sky: 'bg-sky-50 border-sky-200 text-sky-900',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    orange: 'bg-orange-50 border-orange-200 text-orange-900'
  };

  const iconClasses = {
    sky: 'text-sky-500',
    emerald: 'text-emerald-500',
    orange: 'text-orange-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 p-4 mb-4 ${colorClasses[accentColor] || colorClasses.sky}`}
    >
      <div className="flex items-start gap-3">
        <HelpCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${iconClasses[accentColor] || iconClasses.sky}`} />
        <div>
          <p className="text-lg font-bold leading-snug">{instruction}</p>
          {tip && (
            <p className="text-sm opacity-75 mt-1">{tip}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InstructionBar;
