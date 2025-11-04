import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

/**
 * Parse CSV file buffer and extract email column
 */
export interface ParsedCSVResult {
  emails: string[];
  headers: string[];
  rows: Record<string, string>[];
  emailColumnName: string;
}

/**
 * Parses CSV buffer and detects email column
 */
export function parseCSV(
  fileBuffer: Buffer,
  emailColumnIndex: number = 0,
): ParsedCSVResult {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (records.length === 0) {
    throw new Error('CSV file is empty or has no valid data');
  }

  const headers = Object.keys(records[0]);

  if (headers.length === 0) {
    throw new Error('No columns found in CSV file');
  }

  const emailColumnName = headers[emailColumnIndex] || headers[0];
  const emails: string[] = [];

  for (const row of records) {
    const email = row[emailColumnName];
    if (email && typeof email === 'string') {
      emails.push(email.trim().toLowerCase());
    }
  }

  return {
    emails,
    headers,
    rows: records,
    emailColumnName,
  };
}

/**
 * Generate CSV string from data
 */
export function generateCSV(
  data: Record<string, string>[],
  columns: string[],
): string {
  if (data.length === 0) {
    return '';
  }

  return stringify(data, {
    header: true,
    columns,
  });
}

/**
 * Validate email format using regex
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize filename for download
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number | undefined): string {
  return (num ?? 0).toLocaleString('en-US');
}

/**
 * Calculate percentage
 */
export function calculatePercentage(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}
