import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { queryTotalReferrerBonus } from '../../utils/graphql';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { AddressDisplay } from '../common/AddressDisplay';
import { formatPrice, formatTimestamp } from '../../utils/format';
import { Pagination } from '../common/Pagination';
import { PAGE_SIZE_OPTIONS } from '../../config/constants';
import { ErrorBox } from '../common/ErrorBox';
import { ModalTopBar } from '../common/ModalTopBar';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { loading, error, data } = useQuery(queryTotalReferrerBonus, {
    variables: {
      mint,
      referrerMain
    },
    skip: !isOpen
  });

  if (!isOpen) return null;

  if (loading) return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box flex justify-center items-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  );

  if (error) return (
    <ErrorBox title="Error" message={error.message} />
  );

  const paginatedEntities = data.mintTokenEntities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(data.mintTokenEntities.length / pageSize);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box w-11/12 max-w-5xl">
        <ModalTopBar title={`Referral Bonus Details`} onClose={onClose} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="pixel-card">
            <div className="pixel-card-body">
              <h4 className="pixel-card-title">Summary</h4>
              <div className="space-y-2">
                <p>Total Referral Bonus: <span className="font-bold text-primary">
                  {formatPrice(totalBonus, 3)} SOL
                </span></p>
                <p>Total Referral Transactions: {data.mintTokenEntities.length}</p>
              </div>
            </div>
          </div>
          <div className="pixel-card">
            <div className="pixel-card-body">
              <h4 className="pixel-card-title">Token Information</h4>
              <div className="space-y-2">
                <p>Mint Address: <AddressDisplay address={mint} /></p>
                <p>Referrer: <AddressDisplay address={referrerMain} /></p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content">Rows per page:</span>
            <select
              className="select select-bordered select-sm"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="pixel-table w-full">
            <thead>
              <tr>
                <th className=''>Transaction ID</th>
                <th className=''>Minter</th>
                <th className=''>Time</th>
                <th className=''>Checkpoint</th>
                <th className=''>Referrer Fee</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntities.map((entity: any, index: number) => (
                <tr key={index}>
                  <td className=''><AddressDisplay address={entity.txId} type='transaction' /></td>
                  <td className=''><AddressDisplay address={entity.sender} /></td>
                  <td className=''>{formatTimestamp(parseInt(entity.timestamp))}</td>
                  <td className=''>{entity.currentEpoch}</td>
                  <td className=''>{formatPrice(parseFloat(entity.referrerFee) / LAMPORTS_PER_SOL, 3)} SOL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={data.mintTokenEntities.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
    </div>
  );
};
