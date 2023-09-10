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

  getAllMovies() {
    return this.getResourse(
      'https://api.themoviedb.org/3/search/movie?query=return&include_adult=false&language=en-US&page=1'
    );
  }

  getGenres() {
    return this.getResourse('https://api.themoviedb.org/3/genre/movie/list?language=en');
  }

  searchMovies(query) {
    return this.getResourse(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&include_adult=false&language=en-US&page=1`
    );
  }
}

export default new MovieService();
