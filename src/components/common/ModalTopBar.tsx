import { FC } from "react";

export type ModalTopBarProps = {
  title: string;
  onClose: () => void;
}

export const ModalTopBar: FC<ModalTopBarProps> = ({
  title,
  onClose,
}) => {
  return (
    <div className="sticky bg-base-100 z-10 pb-4">
      <button
        className="btn btn-circle btn-sm btn-error absolute right-1"
        onClick={onClose}
      >
        <svg className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M5 5h2v2H5V5zm4 4H7V7h2v2zm2 2H9V9h2v2zm2 0h-2v2H9v2H7v2H5v2h2v-2h2v-2h2v-2h2v2h2v2h2v2h2v-2h-2v-2h-2v-2h-2v-2zm2-2v2h-2V9h2zm2-2v2h-2V7h2zm0 0V5h2v2h-2z" fill="currentColor" /> </svg>
      </button>
      <h3 className="font-bold text-lg ml-2">{title}</h3>
    </div>
  );
}