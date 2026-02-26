import { useState, useEffect, useRef } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Hook for adding advanced Apple-style magnetic liquid hover effects.
 * Calculates magnetic pull, 3D tilt, and light angles based on cursor position.
 * @param {Object} options Configuration
 * @param {number} options.magneticStrength Multiplier for how far elements move towards cursor (default: 0.2)
 * @param {number} options.tiltStrength Multiplier for 3D rotation (default: 5)
 * @returns {Object} { ref, styles, handlers, isHovered }
 */
export const useMagneticHover = ({ magneticStrength = 0.2, tiltStrength = 8 } = {}) => {
    const ref = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    // Trackers
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics configuration for a fluid "liquid" feel
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // Derived transforms
    const translateX = useTransform(springX, (v) => v * magneticStrength);
    const translateY = useTransform(springY, (v) => v * magneticStrength);

    const rotateX = useTransform(springY, [-100, 100], [tiltStrength, -tiltStrength]);
    const rotateY = useTransform(springX, [-100, 100], [-tiltStrength, tiltStrength]);

    // Derived values for lighting (percentage based 0 to 100 on the element)
    // We normalize the mouse coordinates (-width/2 to width/2) to percentage (0% to 100%)
    const lightX = useTransform(springX, (v) => {
        if (!ref.current) return 50;
        const width = ref.current.getBoundingClientRect().width;
        // Map from range (-width/2 .. width/2) to (0 .. 100)
        return ((v + width / 2) / width) * 100;
    });

    const lightY = useTransform(springY, (v) => {
        if (!ref.current) return 50;
        const height = ref.current.getBoundingClientRect().height;
        // Map from range (-height/2 .. height/2) to (0 .. 100)
        return ((v + height / 2) / height) * 100;
    });

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        // Calculate distance from center of the element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        // Reset springs to center
        mouseX.set(0);
        mouseY.set(0);
    };

    // Auto-reset when unmounted or ref changes
    useEffect(() => {
        return () => {
            mouseX.set(0);
            mouseY.set(0);
        };
    }, []);

    // Provide pre-built styles to spread onto the motion element
    const styles = {
        x: translateX,
        y: translateY,
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        // Expose light coordinates as custom CSS variables for generic gradient backgrounds
        '--mouse-x': useTransform(lightX, v => `${v}%`),
        '--mouse-y': useTransform(lightY, v => `${v}%`)
    };

    const handlers = {
        onMouseMove: handleMouseMove,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
    };

    return { ref, styles, handlers, isHovered, lightX, lightY };
};
