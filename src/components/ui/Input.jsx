import React from 'react';

const Input = ({ className = '', borderFull = true, ...props }) => {
    return (
        <input
            className={`input-field focus:input-focus ${className}`}
            {...props}
        />
    );
};

export default Input;
