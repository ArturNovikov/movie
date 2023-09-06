import React, { Component } from 'react';
import { Col, Row } from 'antd';

import MovieItem from '../movie-item/'
import movieService from '../../services';

import './movie-bord.css'

export default class MovieBord extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            movies: [],
        };
    };

    componentDidMount() {
        movieService.getAllMovies()
            .then(data => {
                this.setState({
                    movies: data.results
                })
                console.log(data)
            })
            .catch(error => console.error(error));

    };

    render() {

        const { movies } = this.state;

        return(
            <div className="card-container">
                <Row gutter={[36, 36]} justify="center">
                {movies.map((movie, index) => (
                    <Col key={ index } span={12}>
                        <MovieItem movie={ movie } />
                    </Col>
                ))}
                </Row>
            </div>
        );
    };
};
