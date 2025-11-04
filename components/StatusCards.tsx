'use client';

import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { StatusCounts } from '@/lib/types';
import { formatNumber } from '@/lib/utils/csv';

interface StatusCardsProps {
  statusCounts: StatusCounts;
}

const statusConfig = [
  {
    key: 'VALID' as const,
    label: 'Valid',
    icon: CheckCircle,
    colorClass: 'text-green-600 dark:text-green-400',
    bgClass: 'bg-green-50 dark:bg-green-950/20',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  {
    key: 'INVALID' as const,
    label: 'Invalid',
    icon: XCircle,
    colorClass: 'text-red-600 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    borderClass: 'border-red-200 dark:border-red-800',
  },
];

export default function StatusCards({ statusCounts }: StatusCardsProps) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
      {statusConfig.map(config => {
        const Icon = config.icon;
        const count = statusCounts[config.key];

        return (
          <div
            key={config.key}
            className={`${config.bgClass} ${config.borderClass} border rounded-lg p-4 transition-all`}>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {config.label}
              </span>
              <Icon className={`w-5 h-5 ${config.colorClass}`} />
            </div>
            <p className={`text-2xl font-bold ${config.colorClass}`}>
              {formatNumber(count)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
