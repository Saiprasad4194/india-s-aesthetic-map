interface AshokaChakraProps {
  className?: string;
}

const AshokaChakra = ({ className = "" }: AshokaChakraProps) => {
  const spokes = 24;
  
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
    >
      {/* Outer Ring */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Inner Ring */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      
      {/* Center Circle */}
      <circle cx="50" cy="50" r="8" />
      
      {/* Spokes */}
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes;
        const rad = (angle * Math.PI) / 180;
        const x1 = 50 + 10 * Math.cos(rad);
        const y1 = 50 + 10 * Math.sin(rad);
        const x2 = 50 + 46 * Math.cos(rad);
        const y2 = 50 + 46 * Math.sin(rad);
        
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="2"
          />
        );
      })}
      
      {/* Curved elements between spokes */}
      {Array.from({ length: spokes }).map((_, i) => {
        const angle1 = (i * 360) / spokes;
        const angle2 = ((i + 1) * 360) / spokes;
        const midAngle = (angle1 + angle2) / 2;
        const rad = (midAngle * Math.PI) / 180;
        const x = 50 + 28 * Math.cos(rad);
        const y = 50 + 28 * Math.sin(rad);
        
        return (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r="2"
            fill="currentColor"
          />
        );
      })}
    </svg>
  );
};

export default AshokaChakra;
