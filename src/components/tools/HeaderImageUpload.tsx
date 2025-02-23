import React, { useRef, useState } from 'react';
import { ARSEEDING_GATEWAY_URL, ARWEAVE_GATEWAY_URL, IRYS_GATEWAY_URL, MAX_HEADER_FILE_SIZE, STORAGE, VALID_IMAGE_TYPES } from '../../config/constants';

interface HeaderImageUploadProps {
  onImageChange: (file: File | null) => void;
  currentHeader?: string;
}

export const HeaderImageUpload: React.FC<HeaderImageUploadProps> = ({
  onImageChange,
  currentHeader
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Check file size
      if (file.size > MAX_HEADER_FILE_SIZE) {
        setError('File size must be less than 3MB');
        resolve(false);
        return;
      }

      // Check file type
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        setError('Only PNG, JPG, GIF, WEBP and AVIF files are allowed');
        resolve(false);
        return;
      }

      setError(null);
      resolve(true);
    });
  };

  const handleImageChange = async (file: File | null) => {
    if (file) {
      const isValid = await validateImage(file);
      if (!isValid) {
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    } else {
      setPreviewUrl(null);
      setError(null);
      onImageChange(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleImageChange(file);
  };

  const handleRemoveImage = () => {
    handleImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = () => {
    if (STORAGE === "arweave") return currentHeader && currentHeader !== ARWEAVE_GATEWAY_URL + "/" && currentHeader !== ARSEEDING_GATEWAY_URL + "/"
    else if (STORAGE === "irys") return currentHeader && currentHeader !== IRYS_GATEWAY_URL + "/"
    else return false
  }

  return (
    <div className="space-y-2">
      <label className="label">
        <span className="label-text">Header Image (Max 3MB, suggested ratio width:height = 3:1)</span>
      </label>
      <div
        className='pixed-box cursor-pointer'
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {previewUrl ? (
          <div className="pixel-box relative">
            <img
              src={previewUrl}
              alt="Header preview"
              className="w-full h-auto aspect-[3/1] object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage();
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : hasImage() ? (
          <div className="pixel-box relative">
            <img
              src={`${currentHeader}`}
              alt="Current header"
              className="w-full h-auto aspect-[3/1] object-cover"
            />
            <div className="absolute top-2 right-2 bg-base-100 px-2 py-1 rounded text-sm opacity-75">
              Current Header
            </div>
          </div>
        ) : (
          <div className="pixel-box flex flex-col items-center justify-center py-8">
            <svg className="mx-auto h-12 w-12 text-base-content" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M22 3H2v18h20v-2h-2v-2h2v-2h-2v-2h2v-2h-2V9h2V7h-2V5h2V3zm-2 4v2h-2v2h2v2h-2v2h2v2h-2v2H4V5h14v2h2zm-6 2h-2v2h-2v2H8v2H6v2h2v-2h2v-2h2v-2h2v2h2v-2h-2V9zM6 7h2v2H6V7z" fill="currentColor" /> </svg>
            <div className="text-sm text-base-content">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-base-content">
              PNG, JPG, GIF, WEBP, AVIF up to {MAX_HEADER_FILE_SIZE / 1024 / 1024} MB
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="text-error text-sm mt-1">{error}</div>
      )}
    </div>
  );
};
