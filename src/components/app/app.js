import React from 'react';

import './app.css';
import { ContextProvider } from '../contexts/contextAll';
import MovieBord from '../movie-bord';

const App = () => (
  <div className="App">
    <ContextProvider>
      <MovieBord />
    </ContextProvider>
  </div>
);

export default App;
