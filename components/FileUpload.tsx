'use client';

import React, { useState, useRef } from 'react';
import { CloudUpload, FileText, X, AlertCircle } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/csv';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

export default function FileUpload({
  onFileSelect,
  isUploading,
  error,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className='w-full'>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
            : error
            ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}>
        <input
          ref={inputRef}
          type='file'
          accept='.csv'
          onChange={handleChange}
          className='hidden'
          id='file-upload'
          disabled={isUploading}
        />

        {!selectedFile ? (
          <label
            htmlFor='file-upload'
            className='flex flex-col items-center justify-center cursor-pointer'>
            <CloudUpload className='w-12 h-12 text-gray-400 dark:text-gray-500 mb-4' />
            <p className='text-base font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Drop your CSV file here, or click to browse
            </p>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Maximum file size: 5MB
            </p>
          </label>
        ) : (
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <FileText className='w-10 h-10 text-blue-500' />
              <div>
                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {selectedFile.name}
                </p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={clearFile}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
                type='button'>
                <X className='w-5 h-5 text-gray-500' />
              </button>
            )}
          </div>
        )}

        {isUploading && (
          <div className='absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center'>
            <div className='flex flex-col items-center'>
              <div className='w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2'></div>
              <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Parsing file...
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className='mt-3 flex items-start space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg'>
          <AlertCircle className='w-5 h-5 shrink-0 mt-0.5' />
          <p className='text-sm'>{error}</p>
        </div>
      )}
    </div>
  );
}
