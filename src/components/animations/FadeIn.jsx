import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 600, 
  className = '',
  threshold = 0.1 
}) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold });

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;

