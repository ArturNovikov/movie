import React, { Component } from 'react';
import { Pagination, Tabs, Input } from 'antd';

import MovieItem from '../movie-item/';
import movieService from '../../services';

import './movie-bord.css';

export default class MovieBord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      genres: [],
      searchCurrentPage: 1,
      ratedCurrentPage: 1,
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
      })
      .catch((error) => console.error(error));

    movieService
      .getGenres()
      .then((data) => {
        this.setState({
          genres: data.genres,
        });
      })
      .catch((error) => console.log(error));
  }

  getGenreNames(genreIds) {
    const { genres } = this.state;
    if (!genreIds || !genres) return [];
    return genreIds.map((id) => genres.find((genre) => genre.id === id)?.name || '').filter((name) => name);
  }

  handlePageChange = (type, page) => {
    if (type === 'search') {
      this.setState({
        searchCurrentPage: page,
      });
    } else if (type === 'rated') {
      this.setState({
        ratedCurrentPage: page,
      });
    }
  };

  handleMovieSearch = (query) => {
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

  getCurrentMovies = (currentPage, moviesList) => {
    const startIndex = (currentPage - 1) * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    return moviesList.slice(startIndex, endIndex);
  };

  render() {
    const { movies, genres, itemsPerPage } = this.state;

    if (!movies.length || !genres.length) {
      return <div>Loading...</div>;
    }

    const sortedMovies = [...movies].sort((a, b) => b.vote_average - a.vote_average);

    const currentSearchMovies = this.getCurrentMovies(this.state.searchCurrentPage, movies);
    const currentRatedMovies = this.getCurrentMovies(this.state.ratedCurrentPage, sortedMovies);

    const items = [
      {
        key: '1',
        label: 'Search',
        content: (
          <>
            <Input.Search placeholder="Type to search..." className="InputSearch" onSearch={this.handleMovieSearch} />
            <div className="movieItemContainer">
              {currentSearchMovies.map((movie, index) => (
                <div key={index} className="movieItemContainerChild">
                  <MovieItem movie={movie} genres={this.getGenreNames(movie.genre_ids)} />
                </div>
              ))}
            </div>
            <Pagination
              className="Pagination"
              current={this.state.searchCurrentPage}
              onChange={(page) => this.handlePageChange('search', page)}
              pageSize={itemsPerPage}
              total={movies.length}
            />
          </>
        ),
      },

      {
        key: '2',
        label: 'Rated',
        content: (
          <>
            <Input.Search placeholder="Type to search..." className="InputSearch" onSearch={this.handleMovieSearch} />
            <div className="movieItemContainer">
              {currentRatedMovies.map((movie, index) => (
                <div key={index} className="movieItemContainerChild">
                  <MovieItem movie={movie} genres={this.getGenreNames(movie.genre_ids)} />
                </div>
              ))}
            </div>
            <Pagination
              className="Pagination"
              current={this.state.ratedCurrentPage}
              onChange={(page) => this.handlePageChange('rated', page)}
              pageSize={itemsPerPage}
              total={movies.length}
            />
          </>
        ),
      },
    ];

    return (
      <div className="card-container">
        <Tabs
          defaultActiveKey="1"
          centered
          items={items.map((item) => ({
            key: item.key,
            label: item.label,
            children: item.content,
          }))}
        />
      </div>
    );
  }
}
