import React from 'react';
import './card-description.css';

const CardDescription = ({ overview }) => {
  const truncateDescription = (str, maxLength = 150) => {
    if (str.length <= maxLength && str.length != 0) return str;

    let trimmed = str.substr(0, maxLength);
    return trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(' '))) + '...';
  };

  let description = truncateDescription(overview);
  let descriptionClass = 'cardDescription';

  if (!overview || overview.length === 0) {
    description = 'There is no description yet. But we really tried to find it!';
    descriptionClass += ' noDescription';
  }

  return <p className={descriptionClass}>{description}</p>;
};

export default CardDescription;
