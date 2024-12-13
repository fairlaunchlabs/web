import React, { useEffect, useState } from 'react';
import { TokenImage } from '../mintTokens/TokenImage';
import { InitiazlizedTokenData } from '../../types/types';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { AddressDisplay } from '../common/AddressDisplay';
import { updateMetaData, uploadToArweave } from '../../utils/web3';
import { ToastBox } from '../common/ToastBox';
import { NETWORK, SCANURL } from '../../config/constants';
import { FaUpload } from 'react-icons/fa';
import { HeaderImageUpload } from './HeaderImageUpload';

interface UpdateMetadataModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData;
}

export const UpdateMetadataModal: React.FC<UpdateMetadataModalProps> = ({
    isOpen,
    onClose,
    token,
}) => {
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [website, setWebsite] = useState('');
    const [twitter, setTwitter] = useState('');
    const [discord, setDiscord] = useState('');
    const [telegram, setTelegram] = useState('');
    const [github, setGithub] = useState('');
    const [medium, setMedium] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [headerImage, setHeaderImage] = useState<File | null>(null);
    const [headerPreview, setHeaderPreview] = useState<string>('');

    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    useEffect(() => {
        if(token && token.tokenMetadata && token.tokenMetadata.extensions) {
            setDescription(token.tokenMetadata.description || '');
            setWebsite(token.tokenMetadata.extensions.website || '');
            setTwitter(token.tokenMetadata.extensions.twitter || '');
            setDiscord(token.tokenMetadata.extensions.discord || '');
            setTelegram(token.tokenMetadata.extensions.telegram || '');
            setGithub(token.tokenMetadata.extensions.github || '');
            setMedium(token.tokenMetadata.extensions.medium || '');
            // Reset header image preview when token changes
            setHeaderPreview('');
            setHeaderImage(null);
        }
    }, [token, token?.tokenMetadata, token?.tokenMetadata?.extensions]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Upload header image to Arweave if one is selected
            let headerItemId = '';
            if (headerImage) {
                try {
                    headerItemId = await uploadToArweave(headerImage);
                    console.log("header image itemId", headerItemId);
                } catch (error) {
                    toast.error('Failed to upload header image');
                    setLoading(false);
                    return;
                }
            }

            const newMetadata = {
                name: token.tokenName,
                symbol: token.tokenSymbol,
                image: token.tokenMetadata?.image,
                header: headerItemId || token.tokenMetadata?.header, // Keep existing header if no new one
                description,
                extensions: {
                    website,
                    twitter,
                    discord,
                    telegram,
                    github,
                    medium
                }
            }
            
            const result = await updateMetaData(wallet, connection, token, newMetadata);
            if (result.success) {
                toast.success(
                    <ToastBox 
                        url={`${SCANURL}/tx/${result.data?.tx}?cluster=${NETWORK}`}
                        urlText="View transaction"
                        title={result.message as string}
                    />
                );
                close();
            } else {
                toast.error(result.message as string);
            }
        } catch (error) {
            toast.error('Failed to update metadata');
        } finally {
            setLoading(false);
        }
    };

    const close = () => {
        setLoading(false);
        setTimeout(() => {
            onClose();
        }, 3000);
    }
    
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box relative max-w-2xl">
                <button
                    className="btn btn-circle btn-sm absolute right-2 top-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">Update Token Metadata</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Token Logo and Basic Info */}
                    <div className="flex items-center space-x-6 bg-base-200/50 p-4 rounded-lg">
                        <div className="w-16 h-16 flex-shrink-0">
                            <TokenImage
                                imageUrl={token.tokenMetadata?.image as string}
                                name={token.tokenName}
                                launchTimestamp={Number(token.metadataTimestamp)}
                                className="w-full h-full rounded-lg border-2 border-base-300"
                            />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-base font-bold truncate">{token.tokenName}</h4>
                                <div className="badge badge-sm badge-primary">{token.tokenSymbol}</div>
                            </div>
                            <div className="text-xs text-base-content/70">
                                <span className="font-mono"><AddressDisplay address={token.mint} showCharacters={10}/></span>
                            </div>
                        </div>
                    </div>

                    {/* Header Image Upload */}
                    <div className="mb-6">
                        <HeaderImageUpload
                            onImageChange={(file) => setHeaderImage(file)}
                            currentHeader={token.tokenMetadata?.header}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">
                            <span className="label-text font-semibold">Description</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="textarea textarea-bordered w-full h-24"
                            placeholder="Enter token description..."
                        />
                    </div>

                    {/* Social Information */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Social Information</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Website */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Website</span>
                                </label>
                                <input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://"
                                />
                            </div>

                            {/* Twitter */}
                            <div>
                                <label className="label">
                                    <span className="label-text">X(Twitter)</span>
                                </label>
                                <input
                                    type="url"
                                    value={twitter}
                                    onChange={(e) => setTwitter(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://x.com/"
                                />
                            </div>

                            {/* Discord */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Discord</span>
                                </label>
                                <input
                                    type="url"
                                    value={discord}
                                    onChange={(e) => setDiscord(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://discord.gg/"
                                />
                            </div>

                            {/* Telegram */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Telegram</span>
                                </label>
                                <input
                                    type="url"
                                    value={telegram}
                                    onChange={(e) => setTelegram(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://t.me/"
                                />
                            </div>

                            {/* GitHub */}
                            <div>
                                <label className="label">
                                    <span className="label-text">GitHub</span>
                                </label>
                                <input
                                    type="url"
                                    value={github}
                                    onChange={(e) => setGithub(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://github.com/"
                                />
                            </div>

                            {/* Medium */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Medium</span>
                                </label>
                                <input
                                    type="url"
                                    value={medium}
                                    onChange={(e) => setMedium(e.target.value)}
                                    className="input input-bordered w-full"
                                    placeholder="https://medium.com/"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="space-y-4">
                        <div className="alert alert-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <div>
                                <h3 className="font-bold">Warning!</h3>
                                <div className="text-sm">Updating token metadata will cost 0.1 SOL as a transaction fee.</div>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-warning" 
                                    checked={isConfirmed}
                                    onChange={(e) => setIsConfirmed(e.target.checked)}
                                />
                                <span className="label-text">I understand and agree to pay 0.1 SOL for updating the token metadata</span>
                            </label>
                        </div>

                        <div className="modal-action">
                            <button
                                type="submit"
                                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                                disabled={loading || !isConfirmed}
                            >
                                {loading ? 'Updating...' : 'Update Metadata'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};
