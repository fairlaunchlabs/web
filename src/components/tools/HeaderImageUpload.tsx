import React, { useRef, useState } from 'react';
import { ARSEEDING_GATEWAY_URL, ARWEAVE_GATEWAY_URL, MAX_HEADER_FILE_SIZE, VALID_IMAGE_TYPES } from '../../config/constants';

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
                setError('Only PNG, JPG and GIF files are allowed');
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

    return (
        <div className="space-y-2">
            <label className="label">
                <span className="label-text">Header Image (Max 3MB, suggested ratio width:height = 3:1)</span>
            </label>
            <div
                // className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                //     ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                // `}
                className='pixed-box cursor-pointer'
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif"
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
                ) : currentHeader && currentHeader !== ARWEAVE_GATEWAY_URL + "/" && currentHeader !== ARSEEDING_GATEWAY_URL + "/" ? (
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
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                            Drag and drop an image here, or click to select
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            PNG, JPG, GIF up to 3MB
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
