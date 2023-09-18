import React, { Component } from 'react';
import { Pagination, Tabs, Input, Spin, Alert } from 'antd';
import debounce from 'lodash/debounce';

import ContextAll from '../contexts/contextAll';
import MovieItem from '../movie-item/';
import MovieService from '../../services';

import './movie-bord.css';

export default class MovieBord extends Component {
  static contextType = ContextAll;
  constructor(props) {
    super(props);
    this.state = {
      movies: [],
      searchCurrentPage: 1,
      ratedCurrentPage: 1,
      itemsPerPage: 6,
      loading: true,
      initialized: false,
      error: null,
      currentQuery: '',
      ratedMovies: [],
    };

    this.debouncedSearch = debounce(this.handleMovieSearch, 500);
  }

  componentDidMount() {
    const { guestSessionId } = this.context;
    const moviesPromise = MovieService.getAllMovies();
    const genresPromise = MovieService.getGenres();
    const ratedMoviesPromise = guestSessionId
      ? MovieService.getRatedMovies(guestSessionId)
      : Promise.resolve({ results: [] });

    Promise.all([moviesPromise, genresPromise, ratedMoviesPromise])
      .then(([moviesData, genresData, ratedMoviesData]) => {
        this.setState({
          movies: moviesData.results,
          genres: genresData.genres,
          ratedMovies: ratedMoviesData.results,
          loading: false,
        });
      })
      .catch((error) => {
        console.error(error);
        this.setState({ error: 'On loading Error.' });
      })
      .finally(() => {
        this.setState({ initialized: true, loading: false });
      });
  }

  getRatedMovies = (guestSessionId) => {
    MovieService.getRatedMovies(guestSessionId)
      .then((data) => {
        this.setState({ ratedMovies: data.results });
      })
      .catch((err) => {
        console.error('Error fetching rated movies:', err);
      });
  };

  getGenreNames(genreIds) {
    const genres = this.context.genres;
    if (!genreIds || !genres) return [];
    return genreIds.map((id) => genres.find((genre) => genre.id === id)?.name || '').filter((name) => name);
  }

  getCurrentMovies = (currentPage, moviesList) => {
    const startIndex = (currentPage - 1) * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    return moviesList.slice(startIndex, endIndex);
  };

  handleRatingUpdate = () => {
    if (!this.state.movies || !this.context.ratings) return;

    const ratedMovies = this.state.movies.filter((movie) => this.context.ratings[movie.id]);
    this.setState({ ratedMovies });
  };

  updateRatedMovies = () => {
    const { guestSessionId } = this.context;
    this.getRatedMovies(guestSessionId);
  };

  handlePageChange = (type, page) => {
    this.setState({ loading: true });

    const fetchMovies =
      type === 'search' ? MovieService.getAllMovies(page) : MovieService.searchMovies(this.state.currentQuery, page);

    fetchMovies
      .then((data) => {
        this.setState({
          movies: data.results,
          loading: false,
          [`${type}CurrentPage`]: page,
        });
      })

      .catch((error) => {
        console.log(error);

        this.setState({
          error: 'Error of loading movies for current Page.',
          loading: false,
        });
      });
  };

  handleMovieSearch = (query) => {
    this.setState({ loading: true });
    MovieService.searchMovies(query)
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

  render() {
    const { movies, itemsPerPage, loading, error } = this.state;
    if (this.state.error || error) {
      return <Alert message="Ошибка" description={this.state.error} type="error" showIcon />;
    }

    const sortedMovies = [...this.state.ratedMovies].sort((a, b) => b.vote_average - a.vote_average);
    const currentSearchMovies = this.getCurrentMovies(this.state.searchCurrentPage, movies);
    const currentRatedMovies = this.getCurrentMovies(this.state.ratedCurrentPage, sortedMovies);

    const items = [
      {
        key: '1',
        label: 'Search',
        content: (
          <>
            <Input.Search
              placeholder="Type to search..."
              className="InputSearch"
              onChange={(e) => this.debouncedSearch(e.target.value)}
            />
            <div className="movieItemContainer">
              {currentSearchMovies.map((movie, index) => {
                const genreNames = this.getGenreNames(movie.genre_ids);
                return (
                  <div key={index} className="movieItemContainerChild">
                    <MovieItem
                      guestSessionId={this.context.guestSessionId}
                      movie={movie}
                      genres={genreNames}
                      onRatingUpdate={this.handleRatingUpdate}
                      onRatedMoviesUpdate={this.updateRatedMovies}
                    />
                  </div>
                );
              })}
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
            <div className="movieItemContainer">
              {currentRatedMovies.map((movie, index) => {
                const genreNames = this.getGenreNames(movie.genre_ids);
                return (
                  <div key={index} className="movieItemContainerChild">
                    <MovieItem
                      guestSessionId={this.context.guestSessionId}
                      movie={movie}
                      genres={genreNames}
                      onRatingUpdate={this.handleRatingUpdate}
                      onRatedMoviesUpdate={this.updateRatedMovies}
                    />
                  </div>
                );
              })}
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

    const movieContent = loading ? (
      <div className="example">
        <Spin />
      </div>
    ) : (
      <Tabs
        defaultActiveKey="1"
        centered
        items={items.map((item) => ({
          key: item.key,
          label: item.label,
          children: item.content,
        }))}
      />
    );

    return <div className="card-container">{movieContent}</div>;
  }
}
