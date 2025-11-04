import EmailVerifier from '@/components/EmailVerifier';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function Home() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors'>
      {/* Header */}
      <header className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                VerifyFlow
              </h1>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Rapid Email List Verifier
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'>
        <div className='mb-8 text-center'>
          <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3'>
            Verify Your Email List in 3 Easy Steps
          </h2>
          <p className='text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
            Upload your CSV file, let us verify each email, and download the
            results. Fast, accurate, and easy to use.
          </p>
        </div>

        <EmailVerifier />
      </main>

      {/* Footer */}
      <footer className='bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
            © 2025 VerifyFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
