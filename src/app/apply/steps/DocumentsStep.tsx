'use client';

import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { useApplicationStore } from '@/store/useApplicationStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, PDF allowed';
  }
  if (file.size > MAX_SIZE) {
    return 'File must be under 5MB';
  }
  return null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadSlot({
  label,
  file,
  error,
  onSelect,
  onRemove,
}: {
  label: string;
  file: File | null;
  error: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onSelect(dropped);
    },
    [onSelect],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) onSelect(selected);
      // Reset input so the same file can be re-selected after remove
      if (inputRef.current) inputRef.current.value = '';
    },
    [onSelect],
  );

  const isImage = file && file.type.startsWith('image/');
  const isPdf = file && file.type === 'application/pdf';

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {!file ? (
        <>
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
              dragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            )}
          >
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm text-gray-500">Drop file here or click to upload</p>
            <p className="text-xs text-gray-400">JPG, PNG, PDF — max 5MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleInputChange}
          />
        </>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
          {isImage && (
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="h-[120px] w-[120px] rounded object-cover"
            />
          )}
          {isPdf && (
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded bg-red-50">
              <svg
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Remove file"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function DocumentsStep({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  const { setDocuments } = useApplicationStore();

  const [businessPermit, setBusinessPermit] = useState<File | null>(null);
  const [dtiSec, setDtiSec] = useState<File | null>(null);
  const [validId, setValidId] = useState<File | null>(null);

  const [bpError, setBpError] = useState<string | null>(null);
  const [dtiError, setDtiError] = useState<string | null>(null);
  const [viError, setViError] = useState<string | null>(null);

  const handleSelect = (
    file: File,
    setter: (f: File | null) => void,
    errorSetter: (e: string | null) => void,
  ) => {
    const err = validateFile(file);
    if (err) {
      errorSetter(err);
      setter(null);
      return;
    }
    errorSetter(null);
    setter(file);
  };

  const handleSubmit = () => {
    let valid = true;
    if (!businessPermit) {
      setBpError('Business Permit is required');
      valid = false;
    }
    if (!dtiSec) {
      setDtiError('DTI/SEC Registration is required');
      valid = false;
    }
    if (!validId) {
      setViError('Valid Government ID is required');
      valid = false;
    }
    if (!valid) return;

    setDocuments({ businessPermit, dtiSec, validId });
    onNext();
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-zinc-900">Document Upload</h2>

      <div className="space-y-6">
        <UploadSlot
          label="Business Permit *"
          file={businessPermit}
          error={bpError}
          onSelect={(f) => handleSelect(f, setBusinessPermit, setBpError)}
          onRemove={() => {
            setBusinessPermit(null);
            setBpError(null);
          }}
        />

        <UploadSlot
          label="DTI/SEC Registration *"
          file={dtiSec}
          error={dtiError}
          onSelect={(f) => handleSelect(f, setDtiSec, setDtiError)}
          onRemove={() => {
            setDtiSec(null);
            setDtiError(null);
          }}
        />

        <UploadSlot
          label="Valid Government ID *"
          file={validId}
          error={viError}
          onSelect={(f) => handleSelect(f, setValidId, setViError)}
          onRemove={() => {
            setValidId(null);
            setViError(null);
          }}
        />
      </div>

      <div className="flex gap-3 pt-4">
        {!isFirstStep && (
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
        )}
        <Button onClick={handleSubmit} className="flex-1">
          {isLastStep ? 'Submit' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
