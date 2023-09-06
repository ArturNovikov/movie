 class MovieService {

  async getResourse(url) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmYzJkYWExNTU5ZTJhNDUzMjRmOWUxM2RkNGFkNGIwZCIsInN1YiI6IjY0Zjc3YTdiMmNkZTk4MDBhZDFjYzFjYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.NUOLPt8dh97Wfh7pmBg96dJnjrAZYO9CwFIZl7eJL_8'
      }
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, received ${res.status}`)
    }

    return await res.json();
  }

  getAllMovies() {
    return this.getResourse('https://api.themoviedb.org/3/search/movie?query=return&include_adult=false&language=en-US&page=1')
  }

};

export default new MovieService();

/* 


fetch('https://api.themoviedb.org/3/search/movie?query=return&include_adult=false&language=en-US&page=1', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err)); */