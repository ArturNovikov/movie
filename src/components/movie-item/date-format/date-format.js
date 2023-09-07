import React from 'react';
import { format } from 'date-fns';

import './date-format.css';

const DateFormat = ({ release_date }) => {
  if (!release_date) {
    return <p className="cardMovieData">Дата релиза неизвестна</p>;
  }

  try {
    const formattedDate = format(new Date(release_date), 'MMMM dd, yyyy');
    return <p className="cardMovieData">{formattedDate}</p>;
  } catch (error) {
    console.error(`Ошибка форматирования даты: ${error}`);
    return <p className="cardMovieData">Ошибка даты</p>;
  }
};

export default DateFormat;
