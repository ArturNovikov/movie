import React from 'react';

const RatingContext = React.createContext();

export default RatingContext;

export class RatingProvider extends React.Component {
  state = {
    ratings: {},
  };

  setRating = (movieId, value, callback) => {
    const updatedRatings = { ...this.state.ratings, [movieId]: value };
    this.setState({ ratings: updatedRatings }, callback);
  };

  render() {
    const { children } = this.props;
    return (
      <RatingContext.Provider value={{ ratings: this.state.ratings, setRating: this.setRating }}>
        {children}
      </RatingContext.Provider>
    );
  }
}
