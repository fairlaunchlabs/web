import React, { useState, useEffect } from 'react';
import { ModalTopBar } from './ModalTopBar';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  defaultUsername: string;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultUsername
}) => {
  const [username, setUsername] = useState(defaultUsername);

  // Reset username to default when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername(defaultUsername);
    }
  }, [isOpen, defaultUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(username);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box pixel-box relative p-3">
        <ModalTopBar title="Set Username" onClose={onClose} />
        <div className="space-y-4 p-2">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input w-full"
                placeholder="Enter your username"
                autoFocus
                required
              />
            </div>
            <div className="text-sm mb-3">
              Default username is from your wallet address, you can amend it.
            </div>
            <div className="flex justify-center">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
