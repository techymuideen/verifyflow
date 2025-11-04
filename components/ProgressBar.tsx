'use client';

import React from 'react';
import { calculatePercentage } from '@/lib/utils/csv';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({
  current,
  total,
  label,
}: ProgressBarProps) {
  const percentage = calculatePercentage(current, total);

  return (
    <div className='w-full'>
      {label && (
        <div className='flex justify-between items-center mb-2'>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            {label}
          </span>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
            {percentage}%
          </span>
        </div>
      )}
      <div className='w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden'>
        <div
          className='h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out rounded-full'
          style={{ width: `${percentage}%` }}>
          <div className='h-full w-full bg-linear-to-r from-transparent to-white/20'></div>
        </div>
      </div>
      <div className='flex justify-between items-center mt-1'>
        <span className='text-xs text-gray-500 dark:text-gray-400'>
          {current.toLocaleString()} of {total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
