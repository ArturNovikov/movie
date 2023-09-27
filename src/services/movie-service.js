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

  async createGuestSession() {
    const res = await fetch(this._baseUrl + `/authentication/guest_session/new?api_key=${this._apiKey}`, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error('Error on get guest token.');
    }

    return await res.json();
  }

  getGenres() {
    return this.getResourse(`${this._baseUrl}/genre/movie/list?language=en`);
  }

  searchMovies(query, page) {
    console.log(query, page);
    return this.getResourse(
      `${this._baseUrl}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`
    );
  }

  async getRatedMovies(guestSessionId, page) {
    console.log(guestSessionId, page);
    const res = await fetch(
      `${this._baseUrl}/guest_session/${guestSessionId}/rated/movies?api_key=${this._apiKey}&page=${page}`,
      { method: 'GET' }
    );

    if (!res.ok) {
      throw new Error('Error on GET rated movies.');
    }
    const data = await res.json();
    console.log(data);
    return data;
  }

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
      throw new Error('Error on add rating.');
    }
  }
}

export default new MovieService();
