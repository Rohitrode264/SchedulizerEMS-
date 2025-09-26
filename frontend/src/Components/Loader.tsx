import React, { useEffect, useState } from 'react';

interface ProcessorLoaderProps {
  size?: number; // Size in pixels (default: 400)
  className?: string;
}

const ProcessorLoader: React.FC<ProcessorLoaderProps> = ({ 
  size = 400, 
  className = "" 
}) => {
  const [timetableEntries, setTimetableEntries] = useState<string[]>([]);
  
  // Calculate responsive measurements based on size
  const center = size / 2;
  const processorSize = size * 0.2; // Smaller processor for more emphasis on flow
  const processorOffset = processorSize / 2;
  const pathLength = size * 0.25;
  const endPointDistance = size * 0.35;

  // Generate simple resource entries
  const generateResourceEntry = () => {
    const resources = [
        'TASK', 'DATA', 'PROC', 'CALC', 'SYNC', 'EXEC', 'LOAD', 'INIT',
        'QUEUE', 'THREAD', 'CACHE', 'MEM', 'IO', 'NET', 'DISK', 'GPU',
        'PIPE', 'LOCK', 'STATE', 'EVENT', 'HASH', 'STACK', 'CORE', 'MSG'
      ];
      
      const codes = [
        'T01', 'T02', 'T03', 'T04', 'T05',
        'D01', 'D02', 'D03', 'D04',
        'P01', 'P02', 'P03', 'P04',
        'E01', 'E02', 'E03', 'E04',
        'L01', 'L02', 'L03', 'L04',
        'C01', 'C02', 'C03', 'C04'
      ];
      
    
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const code = codes[Math.floor(Math.random() * codes.length)];
    
    return `${resource}_${code}`;
  };

  // Animate resource processing
  useEffect(() => {
    const interval = setInterval(() => {
      const newEntry = generateResourceEntry();
      
      setTimetableEntries(prev => {
        const updated = [newEntry, ...prev].slice(0, 3);
        return updated;
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Generate path coordinates for 12 directions (more resource flows)
  const generatePaths = () => {
    const angles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]; // 12 directions
    return angles.map((angle, index) => {
      const radian = (angle * Math.PI) / 180;
      const startX = center + Math.cos(radian) * endPointDistance;
      const startY = center + Math.sin(radian) * endPointDistance;
      const controlX = center + Math.cos(radian) * (endPointDistance * 0.6);
      const controlY = center + Math.sin(radian) * (endPointDistance * 0.6);
      const endX = center + Math.cos(radian) * (pathLength + processorOffset);
      const endY = center + Math.sin(radian) * (pathLength + processorOffset);
      
      return {
        path: `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`,
        startX,
        startY,
        angle,
        index
      };
    });
  };

  const paths = generatePaths();

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`} 
          className="overflow-visible"
        >
          <defs>
            {/* Define paths for animation */}
            {paths.map((pathData, index) => (
              <path
                key={`def-path-${index}`}
                id={`animPath-${index}`}
                d={pathData.path}
                fill="none"
              />
            ))}
          </defs>

          {/* Render connection paths - minimal gray lines */}
          {paths.map((pathData, index) => (
            <path
              key={`path-${index}`}
              d={pathData.path}
              fill="none"
              stroke="rgba(156, 163, 175, 0.4)"
              strokeWidth="1"
              opacity="0.6"
            />
          ))}

          {/* Heavy flow of resources - multiple particles per path */}
          {paths.map((_, pathIndex) => (
            <g key={`particle-group-${pathIndex}`}>
              {/* Primary resource flow - 3 particles per path */}
              {[0, 1, 2].map((particleIndex) => (
                <circle 
                  key={`particle-${pathIndex}-${particleIndex}`}
                  r="2" 
                  fill="rgb(107, 114, 128)"
                  opacity="0.8"
                >
                  <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    begin={`${pathIndex * 0.15 + particleIndex * 0.8}s`}
                  >
                    <mpath href={`#animPath-${pathIndex}`} />
                  </animateMotion>
                </circle>
              ))}
              
              {/* Secondary resource flow - smaller particles */}
              {[0, 1].map((particleIndex) => (
                <circle 
                  key={`small-particle-${pathIndex}-${particleIndex}`}
                  r="1.5" 
                  fill="rgb(156, 163, 175)"
                  opacity="0.6"
                >
                  <animateMotion
                    dur="3.5s"
                    repeatCount="indefinite"
                    begin={`${pathIndex * 0.2 + particleIndex * 1.2}s`}
                  >
                    <mpath href={`#animPath-${pathIndex}`} />
                  </animateMotion>
                </circle>
              ))}
            </g>
          ))}

          {/* Endpoint indicators - minimal circles */}
          {paths.map((pathData, index) => (
            <circle
              key={`endpoint-${index}`}
              cx={pathData.startX}
              cy={pathData.startY}
              r="3"
              fill="none"
              stroke="rgb(156, 163, 175)"
              strokeWidth="1"
              opacity="0.5"
            />
          ))}

          {/* Central processor unit - clean and minimal */}
          <g>
            {/* Processor background */}
            <rect
              x={center - processorOffset}
              y={center - processorOffset}
              width={processorSize}
              height={processorSize}
              fill="rgb(17, 24, 39)"
              stroke="rgb(107, 114, 128)"
              strokeWidth="2"
              rx="4"
            />

            {/* Processing display area */}
            <foreignObject
              x={center - processorOffset + 8}
              y={center - processorOffset + 8}
              width={processorSize - 16}
              height={processorSize - 16}
            >
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="space-y-1 overflow-hidden">
                  {timetableEntries.map((entry, index) => (
                    <div
                      key={`${entry}-${index}`}
                      className={`font-mono transition-all duration-300 ${
                        index === 0 
                          ? 'text-gray-300 font-medium' 
                          : index === 1
                          ? 'text-gray-400 opacity-70'
                          : 'text-gray-500 opacity-40'
                      }`}
                      style={{
                        fontSize: `${size * 0.02}px`,
                        lineHeight: '1.3'
                      }}
                    >
                      {entry}
                    </div>
                  ))}
                </div>
              </div>
            </foreignObject>

            {/* Simple processing indicator - single pulsing dot */}
            <circle
              cx={center}
              cy={center - processorOffset - 12}
              r="2"
              fill="rgb(107, 114, 128)"
              className="animate-pulse"
            />
          </g>

          {/* Additional resource streams - more particles for heavy flow effect */}
          {paths.map((_, pathIndex) => (
            <g key={`extra-flow-${pathIndex}`}>
              {[0, 1, 2, 3].map((particleIndex) => (
                <circle 
                  key={`extra-${pathIndex}-${particleIndex}`}
                  r="1" 
                  fill="rgb(156, 163, 175)"
                  opacity="0.3"
                >
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    begin={`${pathIndex * 0.1 + particleIndex * 0.5}s`}
                  >
                    <mpath href={`#animPath-${pathIndex}`} />
                  </animateMotion>
                </circle>
              ))}
            </g>
          ))}
        </svg>

        {/* Status text - minimal */}
        <div 
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{ top: `${size + 16}px` }}
        >
          <div className="text-gray-400 font-mono text-center">
            <div style={{ fontSize: `${size * 0.03}px` }}>
              PROCESSING TIMETABLE
            </div>
            <div className="flex justify-center space-x-1 mt-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gray-500 rounded-full animate-pulse"
                  style={{ 
                    width: `${size * 0.01}px`,
                    height: `${size * 0.01}px`,
                    animationDelay: `${i * 0.3}s` 
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessorLoader;