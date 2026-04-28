import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', animate = true, hover = true, ...props }) => {
    const Wrapper = animate ? motion.div : 'div';
    const motionProps = animate ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        ...(hover ? {
            whileHover: { y: -2, transition: { duration: 0.25 } },
        } : {})
    } : {};

    return (
        <Wrapper
            className={`glass-card ${className}`}
            {...motionProps}
            {...props}
        >
            {children}
        </Wrapper>
    );
};

export default Card;
