class MovieService {
  async getResourse(url) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_MOVIE_KEY}`,
      },
    };

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, received ${res.status}`);
    }

    return await res.json();
  }

  createGuestSession() {
    const url = `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${process.env.REACT_APP_MOVIE_KEY}`;
    return this.getResourse(url);
  }

  getAllMovies(page = 1) {
    return this.getResourse(
      `https://api.themoviedb.org/3/search/movie?query=lord&include_adult=false&language=en-US&page=${page}`
    );
  }

  getGenres() {
    return this.getResourse('https://api.themoviedb.org/3/genre/movie/list?language=en');
  }

  searchMovies(query, page = 1) {
    return this.getResourse(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&include_adult=false&language=en-US&page=${page}`
    );
  }

  getRatedMovies(guestSessionId) {
    return this.getResourse(
      `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?language=en-US&page=1&sort_by=created_at.asc`
    );
  }

  rateMovie(movieId, ratingValue, guestSessionId) {
    const url = `https://api.themoviedb.org/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}`;
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${process.env.REACT_APP_MOVIE_KEY}`,
      },
      body: JSON.stringify({ value: ratingValue }),
    };

    return fetch(url, options).then((response) => {
      if (!response.ok) {
        throw new Error(`Could not post rating for ${url}, received ${response.status}`);
      }
      return response.json();
    });
  }
}

export default new MovieService();
