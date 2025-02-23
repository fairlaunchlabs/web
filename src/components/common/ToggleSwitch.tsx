import React from 'react';
import { ToggleSwitchProps } from '../../types/types';

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <label htmlFor={id} className="text-sm font-medium text-base-content">
        {label}
      </label>
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={onChange}
        className="pixel-switch"
        data-checked={checked}
      >
        <span
          aria-hidden="true"
          className="pixel-switch-button"
          data-checked={checked}
        />
      </button>
    </div>
  );
};
