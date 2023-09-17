import React from 'react';
import './rating-circle.css';

const getRatingColor = (score) => {
  if (score < 3) return '#E90000';
  if (score >= 3 && score < 5) return '#E97E00';
  if (score >= 5 && score <= 7) return '#E9D100';
  return '#66E900';
};

const RatingCircle = ({ score }) => {
  const circleStyle = {
    backgroundColor: getRatingColor(score),
  };

  return (
    <div className="rating-circle" style={circleStyle}>
      {score}
    </div>
  );
};

export default RatingCircle;
