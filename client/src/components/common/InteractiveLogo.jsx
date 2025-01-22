import React, { useState, useEffect } from "react";

const InteractiveLogo = ({ src, alt, className }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState(null);
  const containerRef = React.useRef(null);

  useEffect(() => {
    const updateContainerRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };

    updateContainerRect();
    window.addEventListener('resize', updateContainerRect);
    return () => window.removeEventListener('resize', updateContainerRect);
  }, []);

  const handleMouseMove = (e) => {
    if (containerRect) {
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top;
      setMousePosition({ x, y });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMouseMove}
      style={{ width: 'fit-content' }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.05) 50%, transparent 70%)',
          borderRadius: '50%',
          transition: 'opacity 0.3s ease',
        }}
      />
      <img src={src} alt={alt} className={className} />
    </div>
  );
};

export default InteractiveLogo;
