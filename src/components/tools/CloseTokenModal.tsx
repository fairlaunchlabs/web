import { FC, useState } from "react";
import { InitiazlizedTokenData } from "../../types/types";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { closeToken } from "../../utils/web3";
import toast from "react-hot-toast";

interface CloseTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData | null;
}

export const CloseTokenModal: FC<CloseTokenModalProps> = ({ isOpen, onClose, token }) => {
    const [confirmed, setConfirmed] = useState(false);
    const [loading, setLoading] = useState(false);
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    if (!isOpen || !token) return null;

    const handleClose = async () => {
        if (!confirmed) {
            toast.error("Please confirm the action by checking the checkbox");
            return;
        }

        if (!wallet) {
            toast.error("Please connect your wallet first");
            return;
        }
        
        try {
            setLoading(true);
            const result = await closeToken(wallet, connection, token);
            
            if (result.success) {
                toast.success("Token closed successfully");
                onClose();
            } else {
                toast.error(result.message || "Failed to close token");
            }
        } catch (error: any) {
            console.error('Close mint error:', error);
            toast.error(error.message || "An error occurred while closing the token");
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
                                <div>You are about to close the mint for {token.tokenName} ({token.tokenSymbol}). </div>
                                <div>You will get back some SOL from the closed account.</div>
                                <div>This action cannot be undone and will permanently prevent the creation of new tokens.</div>
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
