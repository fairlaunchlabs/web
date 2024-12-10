import { FC, useState } from "react";
import { InitiazlizedTokenData } from "../../types/types";

interface UpdateMetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData | null;
}

export const UpdateMetadataModal: FC<UpdateMetadataModalProps> = ({ isOpen, onClose, token }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    if (!isOpen || !token) return null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdate = async () => {
        // TODO: Implement update metadata functionality
        onClose();
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Update Token Metadata</h3>
                <div className="py-4">
                    <p className="mb-4">
                        Update metadata for token {token.tokenName} ({token.tokenSymbol})
                    </p>
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text">Token Image</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="file-input file-input-bordered w-full"
                            onChange={handleFileChange}
                        />
                        {previewUrl && (
                            <div className="mt-4">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-action">
                    <button
                        className="btn btn-primary"
                        onClick={handleUpdate}
                        disabled={!imageFile}
                    >
                        Update
                    </button>
                    <button className="btn" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
