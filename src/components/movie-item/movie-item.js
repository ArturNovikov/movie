import React, { Component } from 'react';
import { Card, Space, Tag, Rate, Spin } from 'antd';

import RatingCircle from '../raiting-circle';
import CardDescription from '../card-descriptions';
import DateFormat from '../date-format';

import icon from './—Pngtree—cartoon illustration comics bomb explosion_12297985.png';
import './movie-item.css';

class MovieItem extends Component {
  state = {
    loading: true,
    error: false,
  };

  componentDidUpdate(prevProps) {
    if (prevProps.movie.poster_path !== this.props.movie.poster_path) {
      this.setState({
        loading: true,
        error: false,
      });
    }
  }

  handleImageLoad = () => {
    this.setState({
      loading: false,
    });
  };

  handleImageError = () => {
    this.setState({
      loading: false,
      error: true,
    });
  };

  roundHalf = (num) => Math.round(num * 2) / 2;

  render() {
    const { movie, genres } = this.props;
    const { loading, error } = this.state;
    return (
      <Card hoverable style={{ width: 451, height: 279, borderRadius: 0, position: 'relative' }}>
        <div className="container">
          {loading && <Spin />}
          {error && <img src={icon} alt="Ошибка загрузки." style={{ width: 183, height: '100%' }} />}
          <img
            alt={movie.title}
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            style={{ width: 183, height: '100%', display: error || loading ? 'none' : 'block' }}
            onLoad={this.handleImageLoad}
            onError={this.handleImageError}
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
            <Rate className="ratePosition" count={10} allowHalf defaultValue={this.roundHalf(movie.vote_average)} />
          </div>
          <div className="rating-circle-container">
            <RatingCircle score={movie.vote_average.toFixed(1)} />
          </div>
        </div>
      </Card>
    );
  }
}

export default MovieItem;
