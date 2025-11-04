import { NextRequest, NextResponse } from 'next/server';
import type { ProgressResponse, ErrorResponse } from '@/lib/types';
import jobStore from '@/lib/services/jobStore';

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ProgressResponse | ErrorResponse>> {
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

    return NextResponse.json<ProgressResponse>(
      {
        jobId: job.jobId,
        status: job.status,
        totalEmails: job.totalEmails,
        processedCount: job.processedCount,
        statusCounts: job.statusCounts,
        currentBatch: job.currentBatch,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error('Progress check error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'PROGRESS_ERROR',
        message: `Failed to get progress: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
