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

  componentDidMount() {
    Promise.all([MovieService.getGenres(), MovieService.createGuestSession()])
      .then(([genresData, sessionData]) => {
        this.setState({
          genres: genresData.genres,
          guestSessionId: sessionData.guest_session_id,
        });
      })
      .catch((error) => {
        console.log('Error', error);
      });
  }

  setGuestSessionId = (id) => {
    this.setState({ guestSessionId: id });
  };

  setRating = (movieId, value, callback) => {
    const updatedRatings = { ...this.state.ratings, [movieId]: value };
    this.setState({ ratings: updatedRatings }, callback);
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
          setGuestSessionId: this.state.setGuestSessionId,
        }}
      >
        {children}
      </ContextAll.Provider>
    );
  }
}
