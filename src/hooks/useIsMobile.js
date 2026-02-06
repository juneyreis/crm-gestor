// src/hooks/useIsMobile.js
import { useState, useEffect } from 'react';

/**
 * Hook para detectar se o dispositivo é mobile
 * Breakpoint: < 768px (Tailwind md)
 * @returns {boolean} true se mobile, false se desktop/tablet
 */
export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        // Check inicial
        checkMobile();

        // Listener para resize
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}
