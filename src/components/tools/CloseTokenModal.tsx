import { FC, useState } from "react";
import { InitiazlizedTokenData } from "../../types/types";

interface CloseTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData | null;
}

export const CloseTokenModal: FC<CloseTokenModalProps> = ({ isOpen, onClose, token }) => {
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen || !token) return null;

    const handleClose = async () => {
        if (!confirmed) return;
        
        try {
            setLoading(true);
            // TODO: Implement close token functionality
            onClose();
        } catch (error) {
            console.error('Close mint error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box relative">
                <button
                    className="btn btn-circle btn-sm absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">Close Token Mint</h3>
                
                <div className="space-y-4">
                    <div className="alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="font-bold">Warning!</h3>
                            <div className="text-sm">
                                You are about to close the mint for {token.tokenName} ({token.tokenSymbol}). 
                                This action cannot be undone and will permanently prevent the creation of new tokens.
                            </div>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label cursor-pointer justify-start gap-2">
                            <input 
                                type="checkbox" 
                                className="checkbox checkbox-warning" 
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                            />
                            <span className="label-text">I understand that this action is irreversible</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <button
                            className="btn btn-error w-full"
                            onClick={handleClose}
                            disabled={!confirmed}
                        >
                            {loading ? 'Processing...' : 'Close Mint'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
