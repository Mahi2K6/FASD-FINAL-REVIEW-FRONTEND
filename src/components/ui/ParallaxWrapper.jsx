import React, { useState, useEffect, useCallback } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const ParallaxWrapper = ({ children, className = '', depth = 1 }) => {
    // depth: 1 = background (moves slightly slower), 3 = foreground (moves faster)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e) => {
        const { clientX, clientY } = e;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Calculate normalized position (-1 to 1)
        const x = (clientX / width) * 2 - 1;
        const y = (clientY / height) * 2 - 1;

        setMousePosition({ x, y });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    // Use spring for smooth, cinematic movement
    const springConfig = { damping: 40, stiffness: 200, mass: 0.5 };
    const physicsX = useSpring(mousePosition.x * 10, springConfig);
    const physicsY = useSpring(mousePosition.y * 10, springConfig);

    // Subtle movement range: 2px to 6px based on depth
    // depth 1 (bg): -2px to 2px
    // depth 2 (mid): -4px to 4px
    // depth 3 (fg): -6px to 6px
    const movementOffset = depth * 2;
    
    const xOffset = useTransform(physicsX, [-10, 10], [-movementOffset, movementOffset]);
    const yOffset = useTransform(physicsY, [-10, 10], [-movementOffset, movementOffset]);

    return (
        <motion.div
            className={`w-full h-full ${className}`}
            style={{ x: xOffset, y: yOffset }}
        >
            {children}
        </motion.div>
    );
};
