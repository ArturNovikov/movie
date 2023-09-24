import React, { Component } from 'react';
import { Card, Space, Tag, Rate, Spin } from 'antd';

import RatingCircle from '../raiting-circle';
import CardDescription from '../card-descriptions';
import DateFormat from '../date-format';
import ContextAll from '../contexts/contextAll';
import MovieService from '../../services';

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

  async handleRatingChange(movieId, newRating) {
    const { guestSessionId } = this.props;
    try {
      await MovieService.rateMovie(movieId, newRating, guestSessionId);
      await this.props.onRatedMoviesUpdate();
    } catch (error) {
      console.error('Error on refresh rating:', error);
    }
  }

  roundHalf = (num) => Math.round(num * 2) / 2;

  render() {
    const { movie, genres } = this.props;
    const { loading, error } = this.state;

    return (
      <ContextAll.Consumer>
        {({ ratings, setRating }) => (
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
                <Rate
                  className="ratePosition"
                  count={10}
                  allowHalf
                  value={this.roundHalf(ratings[movie.id])}
                  onChange={(value) => {
                    setRating(movie.id, value, this.props.onRatingUpdate);
                    this.handleRatingChange(movie.id, value);
                    this.props.onRatedMoviesUpdate();
                  }}
                />
              </div>
              <div className="rating-circle-container">
                <RatingCircle
                  key={Date.now()}
                  score={ratings[movie.id] ? this.roundHalf(ratings[movie.id]).toFixed(1) : undefined}
                />
              </div>
            </div>
          </Card>
        )}
      </ContextAll.Consumer>
    );
  }
}

export default MovieItem;
