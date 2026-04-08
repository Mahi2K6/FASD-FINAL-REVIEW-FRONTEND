import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`glass-card hover:glass-card-hover ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
