import React from 'react';
import { motion } from 'framer-motion';

// Spinner Loader
const Loader: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: size, height: size }}
        className="rounded-full border-3 border-gray-200 border-t-[#1A1A1A]"
      />
    </div>
  );
};

// Skeleton shimmer card
const SkeletonCard: React.FC<{ className?: string }> = ({
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 overflow-hidden ${className}`}
    >
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 skeleton-shimmer" />
            <div className="space-y-2">
              <div className="h-4 w-32 rounded-lg bg-gray-200 skeleton-shimmer" />
              <div className="h-3 w-20 rounded-lg bg-gray-100 skeleton-shimmer" />
            </div>
          </div>
          <div className="h-6 w-16 rounded-full bg-gray-200 skeleton-shimmer" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="h-4 w-24 rounded-lg bg-gray-100 skeleton-shimmer" />
          <div className="h-5 w-20 rounded-lg bg-gray-200 skeleton-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Skeleton list (multiple rows)
const SkeletonList: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 flex items-center gap-4 overflow-hidden"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 skeleton-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div
              className="h-4 rounded-lg bg-gray-200 skeleton-shimmer"
              style={{ width: `${60 + ((i * 13) % 30)}%` }}
            />
            <div
              className="h-3 rounded-lg bg-gray-100 skeleton-shimmer"
              style={{ width: `${30 + ((i * 7) % 25)}%` }}
            />
          </div>
          <div className="h-5 w-16 rounded-lg bg-gray-200 skeleton-shimmer flex-shrink-0" />
        </div>
      ))}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export { SkeletonCard, SkeletonList };
export default Loader;
