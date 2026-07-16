import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Spinner from './Spinner';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 700);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isTransitioning) {
    return <Spinner fullScreen />;
  }

  return children;
};

export default PageTransition;