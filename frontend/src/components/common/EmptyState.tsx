import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {icon && (
        <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
