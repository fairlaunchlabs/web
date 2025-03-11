import React, { useState } from 'react';
import { FaStar, FaRegStar } from "react-icons/fa";

interface RatingProps {
  value: number; // Current score (0-5)
  readonly?: boolean; // Is readonly, default false
  onChange?: (value: number) => void; // Callback when selecting a rating
}

export const Rating: React.FC<RatingProps> = ({ value, readonly = false, onChange }) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null); // Mouse hover value

  // Handle click to select a rating
  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  // Handle mouse enter to set hover value
  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  // Handle mouse leave to reset hover value
  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  // Generate 5 stars
  const renderStars = () => {
    const stars = [];
    const displayValue = hoverValue !== null && !readonly ? hoverValue : value; // Use hover value first, then fallback to current value

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= displayValue; // Whether it is filled with a heart
      stars.push(
        <span
          key={i}
          className={`text-lg cursor-pointer transition-colors duration-200 ${
            isFilled ? 'text-primary' : 'text-gray-300'
          } ${readonly ? 'cursor-default' : 'hover:text-primary'}`}
          onClick={() => handleClick(i)}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
        >
          {isFilled ? <FaStar/> : <FaRegStar/>}
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="flex space-x-1">
      {renderStars()}
    </div>
  );
};