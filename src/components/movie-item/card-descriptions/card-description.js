import React from 'react';
import './card-description.css';

const CardDescription = ({ overview }) => {
  const truncateDescription = (str, maxLength = 150) => {
    if (str.length <= maxLength) return str;

    let trimmed = str.substr(0, maxLength);

    return trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
  };

  return <p className="cardDescription">{truncateDescription(overview)}</p>;
};

export default CardDescription;
