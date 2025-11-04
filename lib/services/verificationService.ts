import axios, { AxiosError } from 'axios';
import type { VerificationStatus, EmailRecord } from '../types';
import { isValidEmailFormat, generateCSV } from '../utils/csv';
import { delay, chunkArray } from '../utils/helpers';
import jobStore from './jobStore';

// Configuration
const API_URL = 'https://rapid-email-verifier.fly.dev/api/validate/batch';
const BATCH_SIZE = 100;
const DELAY_MS = 100; // Reduced to 100ms for more instant updates

/**
 * Verify a batch of emails using the external API
 */
async function verifyBatch(
  emails: string[],
): Promise<Map<string, VerificationStatus>> {
  const results = new Map<string, VerificationStatus>();

  try {
    const response = await axios.post(
      API_URL,
      { emails },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      },
    );

    // Process API response - API returns { results: [...] }
    const apiResults = response.data.results;

    if (Array.isArray(apiResults)) {
      for (const result of apiResults) {
        // Preserve the exact API status
        const status = result.status as VerificationStatus;
        results.set(result.email.toLowerCase(), status);
      }
    } else {
      // Mark all as API error if unexpected response
      for (const email of emails) {
        results.set(email.toLowerCase(), 'API_ERROR');
      }
    }
  } catch (error: unknown) {
    // Type-safe error handling
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error(
        'API Error:',
        axiosError.message,
        axiosError.response?.status,
      );
    } else if (error instanceof Error) {
      console.error('Verification Error:', error.message);
    } else {
      console.error('Unknown error occurred during verification');
    }

    console.warn(
      `Marking ${emails.length} emails as API_ERROR due to API failure`,
    );

    // Mark all emails in batch as API_ERROR on failure
    for (const email of emails) {
      results.set(email.toLowerCase(), 'API_ERROR');
    }
  }

  return results;
}

/**
 * Process a single batch and update job store
 */
async function processBatch(
  jobId: string,
  emails: string[],
  startIndex: number,
  batchNumber: number,
  totalBatches: number,
): Promise<void> {
  // Update batch info
  jobStore.updateBatchInfo(jobId, {
    currentBatch: batchNumber,
    totalBatches,
    startEmail: startIndex + 1,
    endEmail: startIndex + emails.length,
  });

  // Pre-validate email formats
  const validEmails: string[] = [];

  emails.forEach((email, index) => {
    if (isValidEmailFormat(email)) {
      validEmails.push(email);
    } else {
      jobStore.updateEmailResult(jobId, startIndex + index, 'INVALID_FORMAT');
    }
  });

  // Verify valid emails through API
  if (validEmails.length > 0) {
    const results = await verifyBatch(validEmails);

    // Update job store with results
    let validCount = 0;
    let invalidCount = 0;

    emails.forEach((email, index) => {
      if (isValidEmailFormat(email)) {
        const status = results.get(email.toLowerCase()) || 'API_ERROR';
        jobStore.updateEmailResult(jobId, startIndex + index, status);

        if (status === 'VALID') {
          validCount++;
        } else {
          invalidCount++;
        }
      }
    });
  }
}

/**
 * Start verification process for a job
 * This runs asynchronously and updates the job store as it progresses
 */
export async function startVerification(jobId: string): Promise<void> {
  const job = jobStore.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (job.status !== 'PENDING') {
    throw new Error(`Job ${jobId} is not in PENDING status`);
  }

  // Update status to PROCESSING
  jobStore.updateJobStatus(jobId, 'PROCESSING');

  try {
    const emails = job.emails.map((record: EmailRecord) => record.email);
    const batches = chunkArray(emails, BATCH_SIZE);
    const totalBatches = batches.length;

    // Process batches sequentially with delay
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const startIndex = i * BATCH_SIZE;

      await processBatch(jobId, batch, startIndex, i + 1, totalBatches);

      // Add delay between batches (except after last batch)
      if (i < batches.length - 1) {
        await delay(DELAY_MS);
      }
    }

    // Mark job as completed
    jobStore.updateJobStatus(jobId, 'COMPLETED');
    jobStore.updateBatchInfo(jobId, null);
  } catch (error: unknown) {
    // Type-safe error handling
    if (error instanceof Error) {
      console.error(`Job ${jobId} failed:`, error.message);
    } else {
      console.error(`Job ${jobId} failed with unknown error`);
    }

    jobStore.updateJobStatus(jobId, 'FAILED');
    jobStore.updateBatchInfo(jobId, null);
    throw error;
  }
}

/**
 * Generate CSV data for download
 */
export function generateResultsCSV(jobId: string): string {
  const job = jobStore.getJob(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Only output email and verification_status columns
  const rows = job.emails.map((record: EmailRecord) => {
    return {
      email: record.email,
      verification_status: record.status,
    };
  });

  // Generate CSV with only email and verification_status columns
  const columns = ['email', 'verification_status'];

  return generateCSV(rows, columns);
}
