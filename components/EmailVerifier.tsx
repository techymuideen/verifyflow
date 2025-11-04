'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';
import FileUpload from './FileUpload';
import StepIndicator from './StepIndicator';
import ProgressBar from './ProgressBar';
import StatusCards from './StatusCards';
import BatchInfoDisplay from './BatchInfoDisplay';
import type {
  UploadResponse,
  ProgressResponse,
  StatusCounts,
  BatchInfo,
} from '@/lib/types';
import { formatNumber } from '@/lib/utils/csv';

type Step = 1 | 2 | 3;

interface JobData {
  jobId: string;
  totalEmails: number;
  emailColumnName: string;
}

export default function EmailVerifier() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [jobData, setJobData] = useState<JobData | null>(null);

  // Processing state
  const [processedCount, setProcessedCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    VALID: 0,
    INVALID: 0,
  });
  const [currentBatch, setCurrentBatch] = useState<BatchInfo | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const steps = ['Upload', 'Process', 'Download'];

  // Handle file upload
  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/verify/upload', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as
        | UploadResponse
        | { success: false; error: string; message: string };

      if (!response.ok || !data.success) {
        const errorData = data as {
          success: false;
          error: string;
          message: string;
        };
        throw new Error(errorData.message || 'Upload failed');
      }

      const uploadData = data as UploadResponse;

      console.log(
        '[EmailVerifier] Upload successful, jobId:',
        uploadData.jobId,
      );

      setJobData({
        jobId: uploadData.jobId,
        totalEmails: uploadData.totalEmails,
        emailColumnName: uploadData.emailColumnName,
      });
      setUploadError(null);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload file';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Start verification
  const startVerification = async () => {
    if (!jobData) return;

    console.log(
      '[EmailVerifier] Starting verification for jobId:',
      jobData.jobId,
    );

    try {
      const response = await fetch('/api/verify/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId: jobData.jobId }),
      });

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to start verification');
      }

      setCurrentStep(2);
      startPolling();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to start verification';
      alert(errorMessage);
    }
  };

  // Poll for progress - More frequent for instant updates
  const pollProgress = useCallback(async () => {
    if (!jobData) return;

    try {
      const response = await fetch(
        `/api/verify/progress?jobId=${jobData.jobId}`,
      );
      const data = (await response.json()) as ProgressResponse;

      setProcessedCount(data.processedCount);
      setStatusCounts(data.statusCounts);
      setCurrentBatch(data.currentBatch);

      if (data.status === 'COMPLETED') {
        setIsCompleted(true);
        setCurrentStep(3);
        stopPolling();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Polling error:', errorMessage);
    }
  }, [jobData]);

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    // Poll every 300ms for more instant updates
    pollingIntervalRef.current = setInterval(pollProgress, 300);
    // Also poll immediately
    pollProgress();
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  // Download results
  const downloadResults = () => {
    if (!jobData) return;
    window.location.href = `/api/verify/download?jobId=${jobData.jobId}`;
  };

  // Reset to start new verification
  const startNewVerification = () => {
    setCurrentStep(1);
    setJobData(null);
    setProcessedCount(0);
    setStatusCounts({
      VALID: 0,
      INVALID: 0,
    });
    setCurrentBatch(null);
    setIsCompleted(false);
    setUploadError(null);
    stopPolling();
  };

  return (
    <div className='w-full max-w-5xl mx-auto'>
      <StepIndicator currentStep={currentStep} steps={steps} />

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className='space-y-6'>
          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={isUploading}
            error={uploadError}
          />

          {jobData && !uploadError && (
            <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4'>
              <p className='text-sm text-green-800 dark:text-green-300'>
                <span className='font-semibold'>
                  {formatNumber(jobData.totalEmails)} emails
                </span>{' '}
                detected in column{' '}
                <span className='font-mono bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded'>
                  {jobData.emailColumnName}
                </span>
              </p>
            </div>
          )}

          <button
            onClick={startVerification}
            disabled={!jobData || isUploading}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              !jobData || isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }`}>
            Start Verification
          </button>
        </div>
      )}

      {/* Step 2: Processing */}
      {currentStep === 2 && jobData && (
        <div className='space-y-6'>
          <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
                Verification Progress
              </h3>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  Processing...
                </span>
              </div>
            </div>
            <ProgressBar
              current={processedCount}
              total={jobData.totalEmails}
              label='Overall Progress'
            />
          </div>

          <BatchInfoDisplay batchInfo={currentBatch} />

          <StatusCards statusCounts={statusCounts} />
        </div>
      )}

      {/* Step 3: Download */}
      {currentStep === 3 && jobData && isCompleted && (
        <div className='space-y-6'>
          <div className='bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-8 text-center'>
            <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h3 className='text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2'>
              Verification Complete!
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Successfully verified {formatNumber(jobData.totalEmails)} emails
            </p>
          </div>

          <StatusCards statusCounts={statusCounts} />

          <div className='flex flex-col sm:flex-row gap-4'>
            <button
              onClick={downloadResults}
              className='flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all active:scale-98'>
              <Download className='w-5 h-5' />
              Download Results (CSV)
            </button>
            <button
              onClick={startNewVerification}
              className='flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all active:scale-98'>
              <RefreshCw className='w-5 h-5' />
              Start New Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
