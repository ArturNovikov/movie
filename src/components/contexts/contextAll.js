import React from 'react';

import MovieService from '../../services';

const ContextAll = React.createContext();
export default ContextAll;

export const SessionContext = React.createContext({
  guestSessionId: null,
  setGuestSessionId: () => {},
});

export class ContextProvider extends React.Component {
  state = {
    ratings: {},
    genres: [],
    guestSessionId: null,
  };
  fetchRatingsRecursive = (sessionId, page = 1, allRatings = []) => {
    return MovieService.getRatingsForSession(sessionId, page).then((data) => {
      const newRatings = allRatings.concat(data.results);
      if (data.page < data.total_pages) {
        return this.fetchRatingsRecursive(sessionId, page + 1, newRatings);
      } else {
        return newRatings;
      }
    });
  };
  componentDidMount() {
    const savedGuestSessionId = localStorage.getItem('guestSessionId');
    if (savedGuestSessionId) {
      this.fetchRatingsRecursive(savedGuestSessionId)
        .then((allRatings) => {
          let ratings = {};
          allRatings.forEach((movie) => {
            ratings[movie.id] = movie.rating;
          });
          this.setState({ ratings: ratings, guestSessionId: savedGuestSessionId });
        })
        .catch((error) => {
          console.log('Error fetching ratings:', error);
        });
    } else {
      Promise.all([MovieService.getGenres(), MovieService.createGuestSession()])
        .then(([genresData, sessionData]) => {
          const guestSessionId = sessionData.guest_session_id;
          this.setState({
            genres: genresData.genres,
            guestSessionId: sessionData.guest_session_id,
          });
          localStorage.setItem('guestSessionId', guestSessionId);
        })
        .catch((error) => {
          console.log('Error', error);
        });
    }
  }

  setGuestSessionId = (id) => {
    this.setState({ guestSessionId: id });
  };

  setRating = (movieId, value) => {
    const updatedRatings = { ...this.state.ratings, [movieId]: value };
    this.setState({ ratings: updatedRatings });
  };

  onTabRatingUpdate = () => {
    if (this.state.guestSessionId) {
      this.fetchRatingsRecursive(this.state.guestSessionId)
        .then((allRatings) => {
          let ratings = {};
          allRatings.forEach((movie) => {
            ratings[movie.id] = movie.rating;
          });
          this.setState({ ratings: ratings });
        })
        .catch((error) => {
          console.log('Error updating ratings:', error);
        });
    }
  };

  render() {
    const { children } = this.props;
    return (
      <ContextAll.Provider
        value={{
          ratings: this.state.ratings,
          setRating: this.setRating,
          genres: this.state.genres,
          guestSessionId: this.state.guestSessionId,
          onTabRatingUpdate: this.onTabRatingUpdate,
        }}
      >
        {children}
      </ContextAll.Provider>
    );
  }
}

localStorage.clear();
