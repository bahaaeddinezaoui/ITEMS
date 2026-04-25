import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const containerRef = useRef(null);
    const prevKeyRef = useRef(location.key);

    useEffect(() => {
        if (prevKeyRef.current !== location.key && containerRef.current) {
            containerRef.current.classList.remove('page-enter');
            void containerRef.current.offsetWidth;
            containerRef.current.classList.add('page-enter');
        }
        prevKeyRef.current = location.key;
    }, [location.key]);

    return (
        <div ref={containerRef} className="page-enter">
            {children}
        </div>
    );
};

export default PageTransition;
