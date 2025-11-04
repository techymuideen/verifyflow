'use client';

import React from 'react';
import type { BatchInfo } from '@/lib/types';
import { formatNumber } from '@/lib/utils/csv';

interface BatchInfoDisplayProps {
  batchInfo: BatchInfo | null;
}

export default function BatchInfoDisplay({ batchInfo }: BatchInfoDisplayProps) {
  if (!batchInfo) {
    return null;
  }

  return (
    <div className='bg-gray-900 dark:bg-gray-950 border border-gray-700 rounded-lg p-4 font-mono text-sm'>
      <p className='text-green-400'>
        <span className='text-gray-500'>&gt;</span> Processing Batch{' '}
        {batchInfo.currentBatch}/{batchInfo.totalBatches}
      </p>
      <p className='text-blue-400 mt-1'>
        <span className='text-gray-500'>&gt;</span> Emails{' '}
        {formatNumber(batchInfo.startEmail)} -{' '}
        {formatNumber(batchInfo.endEmail)}
      </p>
    </div>
  );
}
