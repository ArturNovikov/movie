import React from 'react';

import './app.css';
import { RatingProvider } from '../rating-context/RatingContext';
import MovieBord from '../movie-bord';

const App = () => (
  <div className="App">
    <RatingProvider>
      <MovieBord />
    </RatingProvider>
  </div>
);

export default App;
