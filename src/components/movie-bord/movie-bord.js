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
      ratedMovies: {},
      hideOnSinglePage: true,
      activeTab: '1',
      ratedTotalPages: 1,
    };

    this.debouncedSearch = debounce(this.handleMovieSearch, 500);
  }

  componentDidMount() {
    const { guestSessionId } = this.context;
    const genresPromise = MovieService.getGenres();
    const ratedMoviesPromise = guestSessionId
      ? MovieService.getRatedMovies(guestSessionId)
      : Promise.resolve({ results: [] });
    Promise.all([genresPromise, ratedMoviesPromise])
      .then(([genresData, ratedMoviesData]) => {
        this.setState({
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

  getRatedMovies = (guestSessionId, page) => {
    MovieService.getRatedMovies(guestSessionId, page)
      .then((data) => {
        this.setState({
          allRatedMovies: data.results,
          ratedTotalResults: data.total_results,
        });
      })
      .catch((err) => {
        console.error('Error fetching rated movies:', err);
      });
  };

  updateRatedMovies = () => {
    const { guestSessionId } = this.context;
    this.getRatedMovies(guestSessionId, this.state.ratedCurrentPage);
  };

  getGenreNames(genreIds) {
    const genres = this.context.genres;
    if (!genreIds || !genres) return [];
    return genreIds.map((id) => genres.find((genre) => genre.id === id)?.name || '').filter((name) => name);
  }

  getCurrentMovies = (currentPage, moviesList) => {
    const startIndex = (currentPage - 1) * this.state.itemsPerPage;
    const endIndex = startIndex + this.state.itemsPerPage;
    return moviesList ? moviesList.slice(startIndex, endIndex) : [];
  };

  handlePageChange = (type, page) => {
    this.setState({ loading: true });

    let fetchMovies;

    if (type === 'search') {
      fetchMovies = MovieService.searchMovies(this.state.currentQuery, page);
    } else if (type === 'rated') {
      fetchMovies = MovieService.getRatedMovies(this.context.guestSessionId, page);
    }

    if (!fetchMovies) {
      this.setState({ loading: false });
      return;
    }

    fetchMovies
      .then((data) => {
        if (type === 'search') {
          this.setState({
            movies: data.results,
            loading: false,
            searchCurrentPage: page,
          });
        } else if (type === 'rated') {
          this.setState((prevState) => ({
            ratedMovies: {
              ...prevState.ratedMovies,
              [page]: data.results,
            },
            loading: false,
            ratedCurrentPage: page,
          }));
        }
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
            error: 'Nothing is found on your request.',
            loading: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        this.setState({
          error: 'Error on movie search.',
          loading: false,
        });
      });
  };

  render() {
    const { movies, itemsPerPage, loading, error } = this.state;
    if (this.state.error || error) {
      return <Alert message="Error" description={this.state.error} type="error" showIcon />;
    }

    const currentSearchMovies = this.getCurrentMovies(this.state.searchCurrentPage, movies);
    const currentRatedMovies = this.getCurrentMovies(this.state.ratedCurrentPage, this.state.allRatedMovies);

    const items = [
      {
        key: '1',
        label: 'Search',
        content: (
          <>
            <Input.Search
              value={this.state.currentQuery}
              placeholder="Type to search..."
              className="InputSearch"
              onChange={(e) => {
                this.setState({ currentQuery: e.target.value });
                this.debouncedSearch(e.target.value);
              }}
            />
            <div className="movieItemContainer">
              {currentSearchMovies.map((movie) => {
                const genreNames = this.getGenreNames(movie.genre_ids);
                return (
                  <div key={movie.id} className="movieItemContainerChild">
                    <MovieItem
                      guestSessionId={this.context.guestSessionId}
                      movie={movie}
                      genres={genreNames}
                      onRatedMoviesUpdate={this.updateRatedMovies}
                    />
                  </div>
                );
              })}
            </div>
            <Pagination
              className="Pagination"
              defaultCurrent={1}
              current={this.state.searchCurrentPage}
              onChange={(page) => this.handlePageChange('search', page)}
              pageSize={itemsPerPage}
              total={movies.length}
              hideOnSinglePage={this.state.hideOnSinglePage}
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
              {currentRatedMovies.map((movie) => {
                const genreNames = this.getGenreNames(movie.genre_ids);
                return (
                  <div key={movie.id} className="movieItemContainerChild">
                    <MovieItem
                      guestSessionId={this.context.guestSessionId}
                      movie={movie}
                      genres={genreNames}
                      onRatedMoviesUpdate={this.updateRatedMovies}
                    />
                  </div>
                );
              })}
            </div>
            <Pagination
              className="Pagination"
              defaultCurrent={1}
              current={this.state.ratedCurrentPage}
              onChange={(page) => this.handlePageChange('rated', page)}
              pageSize={itemsPerPage}
              total={this.state.ratedTotalResults}
              hideOnSinglePage={this.state.hideOnSinglePage}
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
        activeKey={this.state.activeTab}
        onChange={(key) => this.setState({ activeTab: key })}
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
