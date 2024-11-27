import React from 'react';

interface ToggleSwitchProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
}

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
                className={`${
                    checked ? 'bg-primary' : 'bg-base-300'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
                <span
                    aria-hidden="true"
                    className={`${
                        checked ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
            </button>
        </div>
    );
};
