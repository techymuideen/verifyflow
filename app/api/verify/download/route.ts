import { NextRequest, NextResponse } from 'next/server';
import type { ErrorResponse } from '@/lib/types';
import jobStore from '@/lib/services/jobStore';
import { generateResultsCSV } from '@/lib/services/verificationService';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<string | ErrorResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'INVALID_JOB_ID',
          message: 'Job ID is required',
        },
        { status: 400 },
      );
    }

    const job = jobStore.getJob(jobId);

    if (!job) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'JOB_NOT_FOUND',
          message: `Job ${jobId} not found`,
        },
        { status: 404 },
      );
    }

    if (job.status !== 'COMPLETED') {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'JOB_NOT_COMPLETED',
          message: `Job ${jobId} is not completed yet. Current status: ${job.status}`,
        },
        { status: 400 },
      );
    }

    // Generate CSV
    const csvData = generateResultsCSV(jobId);

    // Return CSV file
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="verified-emails-${jobId}.csv"`,
      },
    });
  } catch (error: unknown) {
    console.error('Download error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'DOWNLOAD_ERROR',
        message: `Failed to download results: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
