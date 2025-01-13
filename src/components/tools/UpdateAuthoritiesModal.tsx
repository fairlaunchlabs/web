import React, { useEffect, useState } from 'react';
import { InitiazlizedTokenData, TokenMetadata2022 } from '../../types/types';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';
import { ModalTopBar } from '../common/ModalTopBar';
import { revokeMetadataUpdateAuthority, getMetadataAccountData2022, isFrozen, revokeTransferHook } from '../../utils/web3';
import { PublicKey } from '@solana/web3.js';
import AlertBox from '../common/AlertBox';

interface UpdateAuthoritiesModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: InitiazlizedTokenData;
}

export const UpdateAuthoritiesModal: React.FC<UpdateAuthoritiesModalProps> = ({
    isOpen,
    onClose,
    token,
}) => {
    const [loading, setLoading] = useState(false);
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [freezeStatus, setFreezeStatus] = useState(true);
    const [metadataMutable, setMetadataMutable] = useState(false);

    useEffect(() => {
        const fetchAuthorities = async () => {
            if (isOpen && token.mint) {
                try {
                    // Get freeze status
                    const _isFrozen = await isFrozen(connection, new PublicKey(token.mint));
                    if (!_isFrozen.success) setFreezeStatus(_isFrozen.data);

                    // Get metadata update authority
                    await getMetadataAuthority();
                } catch (error) {
                    console.error('Error fetching authorities:', error);
                    toast.error('Failed to fetch authorities');
                }
            }
        };

        fetchAuthorities();
    }, [isOpen, token, connection]);

    const handleRevokeTransferHook = async () => {
        setLoading(true);
        try {
            const result = await revokeTransferHook(wallet, connection, token);
            if (!result.success) {
                throw new Error(result.message);
            }
            toast.success('Successfully gave up transfer hook');
            // Refresh the authorities
            const _isFrozen = await isFrozen(connection, new PublicKey(token.mint));
            if (_isFrozen.success) setFreezeStatus(_isFrozen.data);
        } catch (error: any) {
            toast.error(error.message || 'Failed to give up transfer hook');
        } finally {
            setLoading(false);
        }
    };

    const handleGiveupMetadataAuthority = async () => {
        setLoading(true);
        try {
            const result = await revokeMetadataUpdateAuthority(wallet, connection, token);
            if (!result.success) {
                throw new Error(result.message);
            }
            toast.success('Successfully gave up metadata update authority');

            // Refresh the metadata authority
            await getMetadataAuthority();
        } catch (error: any) {
            toast.error(error.message || 'Failed to give up metadata update authority');
        } finally {
            setLoading(false);
        }
    };

    const getMetadataAuthority = async () => {
        const metadata = await getMetadataAccountData2022(connection, new PublicKey(token.metadataAccount));
        if (metadata.success) {
            const metadataData = metadata.data as TokenMetadata2022;
            setMetadataMutable(metadataData.updateAuthority !== null);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box pixel-box relative p-3">
                <ModalTopBar title="Update Authorities" onClose={onClose} />
                <div className="flex flex-col gap-4 mt-4">
                    <div className="text-sm">
                        <p>Transfer Hook: {freezeStatus ? 'Forbidden transaction' : 'Allowed transaction'}</p>
                        <p>Current milestone: {token.currentEra}</p>
                        <p>Target milestone: {token.targetEras}</p>
                    </div>
                    <AlertBox message={`You ${Number(token.currentEra) > Number(token.targetEras) ? 'can' : 'can not'} invoke transfer hook to enable token transactions as the target milestone has ${Number(token.currentEra) > Number(token.targetEras) ? 'been' : 'not been'} reached.`} title={'Alert'} />
                    <button
                        onClick={handleRevokeTransferHook}
                        disabled={loading || !freezeStatus || Number(token.currentEra) <= Number(token.targetEras)}
                        className="btn w-full btn-primary"
                    >
                        Revoke Transfer Freeze
                    </button>
                    <div className="text-sm">
                        <p>Metadata Mutable: {metadataMutable ? 'Mutable' : 'Immutable'}</p>
                    </div>
                    <button
                        onClick={handleGiveupMetadataAuthority}
                        disabled={loading || !metadataMutable}
                        className="btn w-full btn-primary"
                    >
                        Giveup Metadata Update Authority
                    </button>
                </div>
            </div>
        </div>
    );
};
