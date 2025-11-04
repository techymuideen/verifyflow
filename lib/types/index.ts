/**
 * Email verification status types - Exact API statuses
 */
export type VerificationStatus =
  | 'PENDING'
  | 'VALID'
  | 'INVALID_DOMAIN'
  | 'NO_MX_RECORDS'
  | 'INVALID_FORMAT'
  | 'MAILBOX_NOT_FOUND'
  | 'API_ERROR';

/**
 * Job processing status
 */
export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * Individual email record with verification result
 */
export interface EmailRecord {
  email: string;
  status: VerificationStatus;
  originalRow: Record<string, string>; // Original CSV row data
}

/**
 * Status counts for progress tracking - Simplified to VALID or INVALID
 */
export interface StatusCounts {
  VALID: number;
  INVALID: number;
}

/**
 * Batch information for processing feedback
 */
export interface BatchInfo {
  currentBatch: number;
  totalBatches: number;
  startEmail: number;
  endEmail: number;
}

/**
 * Main verification job
 */
export interface VerificationJob {
  jobId: string;
  status: JobStatus;
  totalEmails: number;
  processedCount: number;
  statusCounts: StatusCounts;
  emails: EmailRecord[];
  emailColumnName: string;
  createdAt: Date;
  updatedAt: Date;
  currentBatch: BatchInfo | null;
}

/**
 * API Response types
 */
export interface UploadResponse {
  success: boolean;
  jobId: string;
  totalEmails: number;
  emailColumnName: string;
  message: string;
}

export interface StartResponse {
  success: boolean;
  message: string;
}

export interface ProgressResponse {
  jobId: string;
  status: JobStatus;
  totalEmails: number;
  processedCount: number;
  statusCounts: StatusCounts;
  currentBatch: BatchInfo | null;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

/**
 * External API response from rapid-email-verifier
 */
export interface ExternalAPIResponse {
  email: string;
  valid: boolean;
  disposable: boolean;
  reason?: string;
}

/**
 * Batch verification request to external API
 */
export interface BatchVerificationRequest {
  emails: string[];
}
