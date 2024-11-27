import React, { useRef, useState } from 'react';
import { PinataSDK } from 'pinata-web3';

interface TokenImageUploadProps {
    onImageChange: (file: File | null) => void;
}

// Initialize Pinata client
const pinata = new PinataSDK({
    pinataJwt: process.env.REACT_APP_PINATA_JWT,
    pinataGateway: process.env.REACT_APP_PINATA_GATEWAY
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/gif'];

export const TokenImageUpload: React.FC<TokenImageUploadProps> = ({
    onImageChange,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateImage = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setError('File size must be less than 5MB');
                resolve(false);
                return;
            }

            // Check file type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setError('Only PNG, JPG and GIF files are allowed');
                resolve(false);
                return;
            }

            // Check if image is square
            const img = new Image();
            img.onload = () => {
                if (img.width !== img.height) {
                    setError('Image must be square (same width and height)');
                    resolve(false);
                } else {
                    setError(null);
                    resolve(true);
                }
            };
            img.onerror = () => {
                setError('Invalid image file');
                resolve(false);
            };
            img.src = URL.createObjectURL(file);
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
            <label className="block text-sm font-medium mb-1">
                Token Image
            </label>
            <div
                className={`relative border-2 h-[200px] border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                `}
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
                    <div className="relative h-full">
                        <img
                            src={previewUrl}
                            alt="Token preview"
                            className="h-full mx-auto object-contain rounded"
                        />
                        <button
                            type="button"
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
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
                ) : (
                    <div className="space-y-2 py-8">
                        <svg className="mx-auto h-12 w-12 text-base-content" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-base-content">
                            <span className="font-medium text-primary">Click to upload</span> or drag and drop
                        </div>
                        <p className="text-xs text-base-content">PNG, JPG, GIF up to 2MB (must be square)</p>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
