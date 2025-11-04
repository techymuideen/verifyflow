import { NextRequest, NextResponse } from 'next/server';
import type { StartResponse, ErrorResponse } from '@/lib/types';
import jobStore from '@/lib/services/jobStore';
import { startVerification } from '@/lib/services/verificationService';

export async function POST(
  request: NextRequest,
): Promise<NextResponse<StartResponse | ErrorResponse>> {
  try {
    const body = (await request.json()) as { jobId?: string };
    const { jobId } = body;

    console.log('[API /start] Received jobId:', jobId);

    if (!jobId || typeof jobId !== 'string') {
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
    console.log('[API /start] Job found:', job ? 'YES' : 'NO');

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

    if (job.status !== 'PENDING') {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: 'JOB_ALREADY_STARTED',
          message: `Job ${jobId} is already in ${job.status} status`,
        },
        { status: 400 },
      );
    }

    // Start verification asynchronously (don't await)
    startVerification(jobId).catch((error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(`Verification job ${jobId} failed:`, errorMessage);
    });

    return NextResponse.json<StartResponse>(
      {
        success: true,
        message: 'Verification job started',
      },
      { status: 202 },
    );
  } catch (error: unknown) {
    console.error('Start verification error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: 'START_ERROR',
        message: `Failed to start verification: ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
