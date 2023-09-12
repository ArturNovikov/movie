import React, { Component } from 'react';
import { Pagination, Tabs, Input, Spin, Alert } from 'antd';

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
      loading: true,
      initialized: false,
      error: null,
    };
  }

  componentDidMount() {
    const moviesPromise = movieService
      .getAllMovies()
      .then((data) => {
        this.setState({
          movies: data.results,
          loading: false,
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ error: 'Ошибка при загрузке фильмов.' });
      });

    const genresPromise = movieService
      .getGenres()
      .then((data) => {
        this.setState({
          genres: data.genres,
          loading: false,
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ error: 'Ошибка загрузки жанров.' });
      });
    Promise.all([moviesPromise, genresPromise]).finally(() => {
      this.setState({ initialized: true, loading: false });
    });
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
    this.setState({ loading: true });
    movieService
      .searchMovies(query)
      .then((data) => {
        if (data.results && data.results.length > 0) {
          this.setState({
            movies: data.results,
            currentPage: 1,
            loading: false,
          });
        } else {
          this.setState({
            movies: [],
            error: 'По вашему запросу ничего не найдено.',
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          error: 'При поиске фильмов произошла ошибка.',
          loading: false,
        });
      });
  };

  getCurrentMovies = (currentPage, moviesList) => {
    const startIndex = (currentPage - 1) * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    return moviesList.slice(startIndex, endIndex);
  };

  render() {
    const { movies, genres, itemsPerPage, loading, error } = this.state;

    if (this.state.error || error) {
      return <Alert message="Ошибка" description={this.state.error} type="error" showIcon />;
    }

    if (!movies.length || !genres.length || loading) {
      return (
        <div className="example">
          <Spin />
        </div>
      );
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
