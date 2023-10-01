import React, { Component } from 'react';
import { Pagination, Tabs, Input, Spin, Alert, ConfigProvider } from 'antd';
import debounce from 'lodash/debounce';

import ContextAll from '../contexts/contextAll';
import MovieItem from '../movie-item/';
import MovieService from '../../services';
import iconSearch from '../../assets/search.png';

import './movie-bord.css';

const configSettings = {
  theme: {
    token: {
      paddingLG: 0,
      borderRadius: 6,
      colorPrimary: 'white',
    },
    components: {
      Pagination: {
        itemActiveBg: '#1890FF',
      },
    },
  },
};

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
      activeTab: '1',
      ratedTotalResults: [],
      totalPagesResults: 1,
    };

    this.debouncedSearch = debounce(this.handleMovieSearch, 500);
  }

  componentDidMount() {
    const { guestSessionId } = this.context;
    const ratedMoviesPromise = guestSessionId
      ? MovieService.getRatedMovies(guestSessionId)
      : Promise.resolve({ results: [] });

    ratedMoviesPromise
      .then((ratedMoviesData) => {
        this.setState({
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
    let genres = this.context.genres;
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
            searchCurrentPage: data.page,
          });
        } else if (type === 'rated') {
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
    let searchPage = page;
    MovieService.searchMovies(query, searchPage)
      .then((data) => {
        if (data.results && data.results.length > 0) {
          this.setState({
            movies: data.results,
            currentPage: 1,
            loading: false,
            totalPagesResults: data.total_results,
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
    const {
      movies,
      itemsPerPage,
      loading,
      error,
      ratedMovies,
      currentQuery,
      searchCurrentPage,
      totalPagesResults,
      ratedCurrentPage,
      ratedTotalResults,
      activeTab,
    } = this.state;

    const { guestSessionId } = this.context;

    if (this.state.error || error) {
      return <Alert message="Error" description={this.state.error} type="error" showIcon />;
    }

    const items = [
      {
        key: '1',
        label: 'Search',
        content: (
          <>
            <Input
              id="Input"
              value={currentQuery}
              placeholder="Type to search..."
              className="InputSearch"
              onChange={(e) => {
                this.setState({ currentQuery: e.target.value });
                this.debouncedSearch(e.target.value);
              }}
            />
            {movies.length === 0 && !currentQuery && (
              <div className="search-image-container">
                <img src={iconSearch} alt="Search for movies" />
              </div>
            )}
            <div className="movieItemContainer">
              {movies.map((movie) => {
                const genreNames = this.getGenreNames(movie.genre_ids);
                return (
                  <div key={movie.id} className="movieItemContainerChild">
                    <MovieItem
                      guestSessionId={guestSessionId}
                      movie={movie}
                      genres={genreNames}
                      onRatedMoviesUpdate={this.updateRatedMovies}
                    />
                  </div>
                );
              })}
            </div>
            <ConfigProvider {...configSettings}>
              <Pagination
                className="Pagination"
                defaultCurrent={1}
                current={searchCurrentPage}
                onChange={(page) => this.handlePageChange('search', page)}
                defaultPageSize={itemsPerPage}
                total={totalPagesResults}
                hideOnSinglePage={true}
                itemActiveBg={this.ConfigProvider}
                showSizeChanger={false}
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
            {ratedMovies.length === 0 && (
              <div className="search-image-container">
                <img src={iconSearch} alt="Search for movies" />
              </div>
            )}
            <div className="movieItemContainer">
              {ratedMovies.map((movie) => {
                const genreNames = this.getGenreNames(movie.genre_ids);
                return (
                  <div key={movie.id} className="movieItemContainerChild">
                    <MovieItem
                      guestSessionId={guestSessionId}
                      movie={movie}
                      genres={genreNames}
                      onRatedMoviesUpdate={this.updateRatedMovies}
                    />
                  </div>
                );
              })}
            </div>
            <ConfigProvider {...configSettings}>
              <Pagination
                className="Pagination"
                defaultCurrent={1}
                current={ratedCurrentPage}
                onChange={(page) => this.handlePageChange('rated', page)}
                pageSize={itemsPerPage}
                total={ratedTotalResults}
                hideOnSinglePage={true}
                showSizeChanger={false}
              />
            </ConfigProvider>
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
        activeKey={activeTab}
        onChange={(key) => {
          this.setState({ activeTab: key });
          this.updateRatedMovies();
        }}
        onTabClick={() => {
          this.context.onTabRatingUpdate();
          this.updateRatedMovies();
        }}
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
