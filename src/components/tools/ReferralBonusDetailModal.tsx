import React from 'react';
import { useQuery } from '@apollo/client';
import { queryTotalReferrerBonus } from '../../utils/graphql';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AddressDisplay } from '../common/AddressDisplay';
import { formatTimestamp } from '../../utils/format';

interface ReferralBonusDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    mint: string;
    referrerMain: string;
    totalBonus: number;
}

export const ReferralBonusDetailModal: React.FC<ReferralBonusDetailModalProps> = ({ 
    isOpen, 
    onClose, 
    mint, 
    referrerMain,
    totalBonus
}) => {
    console.log('referrerMain', referrerMain);
    const { loading, error, data } = useQuery(queryTotalReferrerBonus, {
        variables: {
            mint,
            referrerMain
        },
        skip: !isOpen
    });

    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    };

    if (loading) return (
        <div className="modal modal-open">
            <div className="modal-box">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        </div>
    );

    if (error) return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-error">Error loading data</h3>
                <p>{error.message}</p>
                <div className="modal-action">
                    <button className="btn" onClick={handleClose}>Close</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg mb-4">Referral Bonus Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h4 className="card-title">Summary</h4>
                            <div className="space-y-2">
                                <p>Total Referral Bonus: <span className="font-bold text-primary">
                                    {totalBonus.toFixed(4)} SOL
                                </span></p>
                                <p>Total Referral Transactions: {data.mintTokenEntities.length}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h4 className="card-title">Token Information</h4>
                            <div className="space-y-2">
                                <p>Mint Address: <AddressDisplay address={mint} /></p>
                                <p>Referrer: <AddressDisplay address={referrerMain} /></p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto mt-6">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                {/* <th>Mint</th> */}
                                <th>Minter</th>
                                <th>Time</th>
                                <th>Epoch</th>
                                {/* <th>Referrer</th> */}
                                <th>Referrer Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.mintTokenEntities.map((entity: any, index: number) => (
                                <tr key={index}>
                                    <td><AddressDisplay address={entity.txId} type='transaction' /></td>
                                    {/* <td><AddressDisplay address={entity.mint} /></td> */}
                                    <td><AddressDisplay address={entity.sender} /></td>
                                    <td>{formatTimestamp(parseInt(entity.timestamp))}</td>
                                    <td>{entity.currentEpoch}</td>
                                    {/* <td><AddressDisplay address={entity.referrerMain} /></td> */}
                                    <td>{(parseFloat(entity.totalReferrerFee) / LAMPORTS_PER_SOL).toFixed(6)} SOL</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="modal-action">
                    <button className="btn" onClick={handleClose}>Close</button>
                </div>
            </div>
        </div>
    );
};
