import React, { Component } from 'react';
import { Col, Row } from 'antd';

import MovieItem from '../movie-item/';
import movieService from '../../services';

import './movie-bord.css';

export default class MovieBord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      genres: [],
    };
  }

  componentDidMount() {
    movieService
      .getAllMovies()
      .then((data) => {
        this.setState({
          movies: data.results,
        });
        console.log(data.results);
      })
      .catch((error) => console.error(error));

    movieService
      .getGenres()
      .then((data) => {
        this.setState({
          genres: data.genres,
        });
        console.log(data.genres);
      })
      .catch((error) => console.log(error));
  }

  getGenreNames(genreIds) {
    const { genres } = this.state;
    if (!genreIds || !genres) return [];
    return genreIds.map((id) => genres.find((genre) => genre.id === id)?.name || '').filter((name) => name);
  }

  render() {
    const { movies, genres } = this.state;

    if (!movies.length || !genres.length) {
      return <div>Loading...</div>;
    }

    const sortedMovies = [...movies].sort((a, b) => b.vote_average - a.vote_average);

    return (
      <div className="card-container">
        <Row gutter={[36, 36]} justify="center">
          {sortedMovies.map((movie, index) => (
            <Col key={index} span={12}>
              <MovieItem movie={movie} genres={this.getGenreNames(movie.genre_ids)} />
            </Col>
          ))}
        </Row>
      </div>
    );
  }
}
