import { NextRequest, NextResponse } from 'next/server';
import type { UploadResponse, ErrorResponse } from '@/lib/types';
import { parseCSV } from '@/lib/utils/csv';
import jobStore from '@/lib/services/jobStore';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(
  request: NextRequest,
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'NO_FILE',
          message: 'No file provided',
        },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_FILE_TYPE',
          message: 'Only CSV files are allowed',
        },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
        },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse CSV
    const parsed = parseCSV(buffer, 0);

    if (parsed.emails.length === 0) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'NO_EMAILS',
          message: 'No valid emails found in the CSV file',
        },
        { status: 400 },
      );
    }

    // Create job
    const job = jobStore.createJob(
      parsed.emails,
      parsed.rows,
      parsed.emailColumnName,
    );

    console.log(
      '[API /upload] Job created:',
      job.jobId,
      'with',
      job.totalEmails,
      'emails',
    );

    return NextResponse.json<UploadResponse>(
      {
        success: true,
        jobId: job.jobId,
        totalEmails: job.totalEmails,
        emailColumnName: job.emailColumnName,
        message: 'File parsed successfully. Ready to start verification.',
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('Upload error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'PROCESSING_ERROR',
        message: `Failed to process file: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
