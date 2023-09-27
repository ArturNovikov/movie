/* eslint-disable */
import React, { Component } from 'react';
import { Pagination, Tabs, Input, Spin, Alert, ConfigProvider } from 'antd';
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
      itemsPerPage: 20,
      loading: true,
      initialized: false,
      error: null,
      currentQuery: '',
      ratedMovies: [],
      hideOnSinglePage: true,
      activeTab: '1',
      ratedTotalPages: 1,
      ratedTotalResults: [],
      totalPages: 1,
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
          ratedMovies: data.results,
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
      console.log(this.state.currentQuery, page);
    } else if (type === 'rated') {
      fetchMovies = MovieService.getRatedMovies(this.context.guestSessionId, page);
      console.log(this.context.guestSessionId, page);
    }

    if (!fetchMovies) {
      this.setState({ loading: false });
      return;
    }

    fetchMovies
      .then((data) => {
        if (type === 'search') {
          console.log(data);
          this.setState({
            movies: data.results,
            loading: false,
            searchCurrentPage: data.page,
          });
        } else if (type === 'rated') {
          /*           this.setState((prevState) => ({
            ratedMovies: {
              ...prevState.ratedMovies,
              [page]: data.results,
            },
            loading: false,
            ratedCurrentPage: page,
          })); */
          console.log(data);
          this.setState({
            ratedMovies: data.results,
            loading: false,
            ratedCurrentPage: data.page,
          });
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

  handleMovieSearch = (query, page = 1) => {
    this.setState({ loading: true });
    MovieService.searchMovies(query, (page = 1))
      .then((data) => {
        if (data.results && data.results.length > 0) {
          console.log(data.total_results, data);
          this.setState({
            movies: data.results,
            currentPage: 1,
            loading: false,
            totalPages: data.total_pages,
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
    const { movies, itemsPerPage, loading, error, ratedMovies } = this.state;
    if (this.state.error || error) {
      return <Alert message="Error" description={this.state.error} type="error" showIcon />;
    }
    const currentSearchMovies = movies;
    const currentRatedMovies = ratedMovies;

    const items = [
      {
        key: '1',
        label: 'Search',
        content: (
          <>
            <ConfigProvider
              theme={{
                token: {
                  borderRadius: 6,
                },
                components: {
                  Pagination: {
                    itemActiveBg: '#1890FF',
                    itemActiveColorDisabled: 'rgba(0, 0, 0, 0.65)',
                  },
                },
              }}
            >
              <Input
                id="Input"
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
                total={this.state.totalPages}
                hideOnSinglePage={this.state.hideOnSinglePage}
                itemActiveBg={this.ConfigProvider}
              />
            </ConfigProvider>
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
        onChange={(key) => {
          this.setState({ activeTab: key });
          this.updateRatedMovies();
        }}
        onTabClick={this.updateRatedMovies}
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
