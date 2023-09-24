import React from 'react';
import { format } from 'date-fns';

import './date-format.css';

const DateFormat = ({ release_date }) => {
  if (!release_date) {
    return <p className="cardMovieData">Sorry, but there is no release date...</p>;
  }

  try {
    const formattedDate = format(new Date(release_date), 'MMMM dd, yyyy');
    return <p className="cardMovieData">{formattedDate}</p>;
  } catch (error) {
    console.error(`Data format error: ${error}`);
    return <p className="cardMovieData">Date error</p>;
  }
};

export default DateFormat;
