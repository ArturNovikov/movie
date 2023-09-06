import React from 'react';
import { Card, Space, Tag } from 'antd';
import './movie-item.css';

const MovieItem = ({ movie }) => (
    <Card hoverable style={{ width: 451 }}>
        <div style={{ display: 'flex' }}>
            <img
            alt={movie.title}
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            style={{ width: '50%', height: 'auto' }}
            />
            <div style={{ width: '50%', padding: '16px' }}>
                <h3>{movie.title}</h3>
                <p>{movie.release_date}</p>
                <Space size={[0, 8]} wrap>
                    {movie.genre_ids.map((genre) => (
                        <Tag key={genre.id}>
                            {genre.name}
                        </Tag>
                    ))}
                </Space>
                <p>{movie.overview}</p>
            </div>
        </div>
    </Card>
);

export default MovieItem;
