import React, { Component } from 'react';
import { Col, Row, Pagination, Tabs, Input } from 'antd';
import TabPane from 'antd/es/tabs/TabPane';

import MovieItem from '../movie-item/';
import movieService from '../../services';

import './movie-bord.css';

export default class MovieBord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      genres: [],
      currentPage: 1,
      itemsPerPage: 6,
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

  handlePageChange = (page) => {
    this.setState({
      currentPage: page,
    });
  };

  handleMovieSearch = (query) => {
    console.log('handleMovieSearch called with query:', query);
    movieService
      .searchMovies(query)
      .then((data) => {
        this.setState({
          movies: data.results,
          currentPage: 1,
        });
      })
      .catch((error) => console.error(error));
  };

  render() {
    const { movies, genres, currentPage, itemsPerPage } = this.state;

    if (!movies.length || !genres.length) {
      return <div>Loading...</div>;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMovies = movies.slice(startIndex, endIndex);
    const sortedMovies = [...movies].sort((a, b) => b.vote_average - a.vote_average);

    return (
      <div className="card-container">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Search" key="1">
            <Input.Search placeholder="Type to search..." onSearch={this.handleMovieSearch} />
            <Row gutter={[36, 36]} justify="center">
              {currentMovies.map((movie, index) => (
                <Col key={index} span={12}>
                  <MovieItem movie={movie} genres={this.getGenreNames(movie.genre_ids)} />
                </Col>
              ))}
            </Row>
            <Pagination
              current={currentPage}
              onChange={this.handlePageChange}
              pageSize={itemsPerPage}
              total={movies.length}
            />
          </TabPane>
          <TabPane tab="Rated" key="2">
            <Input.Search placeholder="Type to search..." onSearch={this.handleMovieSearch} />
            <Row gutter={[36, 36]} justify="center">
              {sortedMovies.map((movie, index) => (
                <Col key={index} span={12}>
                  <MovieItem movie={movie} genres={this.getGenreNames(movie.genre_ids)} />
                </Col>
              ))}
            </Row>
            <Pagination
              current={currentPage}
              onChange={this.handlePageChange}
              pageSize={itemsPerPage}
              total={movies.length}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
