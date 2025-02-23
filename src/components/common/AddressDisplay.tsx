import React from 'react';
import { formatAddress } from '../../utils/format';
import { AddressDisplayProps } from '../../types/types';
import { NETWORK, SCANURL } from '../../config/constants';
import toast from 'react-hot-toast';

export const AddressDisplay: React.FC<AddressDisplayProps> = ({
  address,
  type = 'account',
  showCharacters = 4,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success('Copied');
  };

  const explorerUrl = `${SCANURL}/${type}/${address}?cluster=${NETWORK}`;

  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel">{showCharacters > 0 ? formatAddress(address, showCharacters) : address}</span>
      <button
        onClick={handleCopy}
        className="btn-ghost btn-xs p-0 min-h-0 h-auto"
        title="Copy Address"
      >
        <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 2h11v2H6v13H4V2zm4 4h12v16H8V6zm2 2v12h8V8h-8z" fill="currentColor" /> </svg>
        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                </svg> */}
      </button>
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost btn-xs p-0 min-h-0 h-auto"
        title="View on Solscan"
      >
        <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3h6v2H5v14h14v-6h2v8H3V3h2zm8 0h8v8h-2V7h-2V5h-4V3zm0 8h-2v2H9v2h2v-2h2v-2zm4-4h-2v2h-2v2h2V9h2V7z" fill="currentColor" /> </svg>
        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg> */}
      </a>
    </div>
  );
};
