import React from 'react';
import { Card, Space, Tag, Rate } from 'antd';

import RatingCircle from './raiting-circle';
import CardDescription from './card-descriptions';
import DateFormat from './date-format';

import './movie-item.css';

const MovieItem = ({ movie, genres }) => {
  const roundHalf = (num) => Math.round(num * 2) / 2;

  return (
    <Card hoverable style={{ width: 451, height: 279, borderRadius: 0, position: 'relative' }}>
      <div className="container">
        <img
          alt={movie.title}
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          style={{ width: 183, height: '100%' }}
        />
        <div style={{ paddingLeft: '20px' }}>
          <h3 className="cardHeader">{movie.title}</h3>

          <DateFormat release_date={movie.release_date} />

          <Space size={[0, 8]} wrap className="tagsContainer">
            {genres &&
              genres.slice(0, 3).map((genre, index) => (
                <Tag className="cardTag" key={index}>
                  {genre}
                </Tag>
              ))}
          </Space>

          <CardDescription overview={movie.overview} />
          <Rate className="ratePosition" count={10} allowHalf defaultValue={roundHalf(movie.vote_average)} />
        </div>
        <div className="rating-circle-container">
          <RatingCircle score={movie.vote_average.toFixed(1)} />
        </div>
      </div>
    </Card>
  );
};

export default MovieItem;
