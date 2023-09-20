/* eslint-disable */
class MovieService {
  _baseUrl = 'https://api.themoviedb.org/3';
  _apiKey = 'fc2daa1559e2a45324f9e13dd4ad4b0d';

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

  /*   createGuestSession() {
    const url = `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${process.env.REACT_APP_MOVIE_KEY}`;
    return this.getResourse(url);
  } */
  async createGuestSession() {
    const res = await fetch(this._baseUrl + `/authentication/guest_session/new?api_key=${this._apiKey}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Ошибка при получении гостевого токена');
    }

    return await res.json();
  }

  /*   getAllMovies(query, page = 1) {
    return this.getResourse(
      `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=false&language=en-US&page=${page}`
    );
  } */

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

  async getRatedMovies(guestSessionId) {
    const res = await fetch(this._baseUrl + `/guest_session/${guestSessionId}/rated/movies?api_key=${this._apiKey}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Ошибка при получении оцененных фильмах');
    }

    return await res.json();
  }

  /*   async rateMovie(movieId, ratingValue, guestSessionId) {
    console.log('Using guestSessionId for rating:', guestSessionId);
    console.log('rateMovie function was called');
    console.log('Rating movie with guestSessionId:', guestSessionId);
    const url = `https://api.themoviedb.org/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}`;
    console.log(movieId);
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${process.env.REACT_APP_MOVIE_KEY}`,
      },
      body: JSON.stringify({ value: ratingValue }),
    };

    console.log(options.body);

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Could not post rating for ${url}, received ${response.status}`);
    }
    return await response.json();
  } */
  async rateMovie(movieId, ratingValue, guestSessionId) {
    const res = await fetch(
      this._baseUrl + `/movie/${movieId}/rating?api_key=${this._apiKey}&guest_session_id=${guestSessionId}`,
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ value: ratingValue }),
      }
    );

    if (!res.ok) {
      throw new Error('Ошибка при добавлении рейтинга');
    }
  }
}

export default new MovieService();
