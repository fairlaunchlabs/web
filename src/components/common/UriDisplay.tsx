import React from 'react';
import { formatAddress } from '../../utils/format';

type UriDisplayProps = {
  uri: string;
  text: string;
  showCharacters?: number;
};
export const UriDisplay: React.FC<UriDisplayProps> = ({
  uri,
  text,
  showCharacters = 4,
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="font-pixel">{showCharacters > 0 ? formatAddress(text, showCharacters) : text}</span>
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost btn-xs p-0 min-h-0 h-auto"
        title="View on Solscan"
      >
        <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 3h6v2H5v14h14v-6h2v8H3V3h2zm8 0h8v8h-2V7h-2V5h-4V3zm0 8h-2v2H9v2h2v-2h2v-2zm4-4h-2v2h-2v2h2V9h2V7z" fill="currentColor" /> </svg>
      </a>
    </div>
  );
};
