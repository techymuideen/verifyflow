import { v4 as uuidv4 } from 'uuid';
import type { VerificationJob, EmailRecord, BatchInfo } from '../types';

/**
 * In-memory job store for managing verification jobs
 * In production, this would be replaced with a database
 */
class JobStore {
  private jobs: Map<string, VerificationJob>;

  constructor() {
    this.jobs = new Map();
  }

  /**
   * Create a new verification job
   */
  createJob(
    emails: string[],
    rows: Record<string, string>[],
    emailColumnName: string,
  ): VerificationJob {
    const jobId = uuidv4();
    const now = new Date();

    const emailRecords: EmailRecord[] = emails.map((email, index) => ({
      email,
      status: 'PENDING' as const,
      originalRow: rows[index] || {},
    }));

    const job: VerificationJob = {
      jobId,
      status: 'PENDING',
      totalEmails: emails.length,
      processedCount: 0,
      statusCounts: {
        VALID: 0,
        INVALID: 0,
      },
      emails: emailRecords,
      emailColumnName,
      createdAt: now,
      updatedAt: now,
      currentBatch: null,
    };

    this.jobs.set(jobId, job);

    return job;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): VerificationJob | undefined {
    const job = this.jobs.get(jobId);

    return job;
  }

  /**
   * Update job status
   */
  updateJobStatus(jobId: string, status: VerificationJob['status']): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = status;
      job.updatedAt = new Date();
    }
  }

  /**
   * Update batch information
   */
  updateBatchInfo(jobId: string, batchInfo: BatchInfo | null): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.currentBatch = batchInfo;
      job.updatedAt = new Date();
    }
  }

  /**
   * Update email verification result
   */
  updateEmailResult(
    jobId: string,
    emailIndex: number,
    status: EmailRecord['status'],
  ): void {
    const job = this.jobs.get(jobId);
    if (!job || !job.emails[emailIndex]) {
      return;
    }

    const oldStatus = job.emails[emailIndex].status;
    const email = job.emails[emailIndex].email;

    // Skip if status hasn't changed
    if (oldStatus === status) {
      return;
    }

    job.emails[emailIndex].status = status;

    // Update counts for UI display (VALID vs everything else)
    // Decrement old status count (only if it was counted before)
    if (oldStatus === 'VALID') {
      job.statusCounts.VALID--;
    } else if (oldStatus !== 'PENDING') {
      // Don't decrement if it was PENDING (not counted yet)
      job.statusCounts.INVALID--;
    }

    // Increment new status count (don't count PENDING)
    if (status === 'VALID') {
      job.statusCounts.VALID++;
    } else if (status !== 'PENDING') {
      job.statusCounts.INVALID++;
    }

    job.processedCount++;
    job.updatedAt = new Date();
  }

  /**
   * Delete a job (cleanup)
   */
  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }

  /**
   * Get all job IDs (for debugging/admin)
   */
  getAllJobIds(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Cleanup old jobs (older than 1 hour)
   */
  cleanupOldJobs(): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (job.createdAt < oneHourAgo) {
        this.jobs.delete(jobId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get job count
   */
  getJobCount(): number {
    return this.jobs.size;
  }
}

// Singleton instance - prevent recreation during HMR
const globalForJobStore = globalThis as unknown as {
  jobStore: JobStore | undefined;
};

const jobStore = globalForJobStore.jobStore ?? new JobStore();

if (process.env.NODE_ENV !== 'production') {
  globalForJobStore.jobStore = jobStore;
}

// Cleanup old jobs every 15 minutes (only once)
if (typeof setInterval !== 'undefined' && !globalForJobStore.jobStore) {
  setInterval(() => {
    jobStore.cleanupOldJobs();
  }, 15 * 60 * 1000);
}

export default jobStore;
