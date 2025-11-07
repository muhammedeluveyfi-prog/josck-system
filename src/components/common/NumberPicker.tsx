import { useState, useRef, useEffect } from 'react';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  unit: string;
}

export default function NumberPicker({ value, onChange, min = 0, max = 100, label, unit }: NumberPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ startY: 0, startValue: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStateRef.current = { startY: e.clientY, startValue: value };
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { startY, startValue } = dragStateRef.current;
    const deltaY = startY - e.clientY;
    const step = 1;
    const newValue = Math.max(min, Math.min(max, startValue + Math.round(deltaY / 15) * step));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStateRef.current = { startY: e.touches[0].clientY, startValue: value };
  };

  const handleTouchMove = (e: TouchEvent) => {
    const { startY, startValue } = dragStateRef.current;
    const deltaY = startY - e.touches[0].clientY;
    const step = 1;
    const newValue = Math.max(min, Math.min(max, startValue + Math.round(deltaY / 15) * step));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, value, min, max, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <label style={{ 
        fontSize: '0.875rem', 
        fontWeight: 600, 
        color: '#002147',
        marginBottom: '0.25rem'
      }}>
        {label}
      </label>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '120px',
          height: '200px',
          overflow: 'hidden',
          border: '2px solid #C7B58D',
          borderRadius: '0.75rem',
          background: 'white',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Gradient overlays */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)',
          pointerEvents: 'none',
          zIndex: 2
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)',
          pointerEvents: 'none',
          zIndex: 2
        }} />
        
        {/* Center indicator line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '2px',
          background: '#002147',
          transform: 'translateY(-50%)',
          zIndex: 1
        }} />

        {/* Numbers */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          position: 'relative',
          height: '100%',
        }}>
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => {
            const distance = Math.abs(num - value);
            const isVisible = distance <= 2;
            const offset = (num - value) * 50;
            
            return (
              <div
                key={num}
                style={{
                  position: 'absolute',
                  fontSize: num === value ? '2rem' : distance === 1 ? '1.5rem' : '1rem',
                  fontWeight: num === value ? 700 : distance === 1 ? 600 : 400,
                  color: num === value ? '#002147' : '#6c757d',
                  opacity: num === value ? 1 : isVisible ? Math.max(0.3, 1 - distance * 0.3) : 0,
                  transition: isDragging ? 'none' : 'all 0.2s ease-out',
                  textAlign: 'center',
                  height: '50px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `translateY(${offset}px)`,
                  pointerEvents: 'none',
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{
        fontSize: '0.875rem',
        color: '#6c757d',
        fontWeight: 500,
        marginTop: '0.25rem'
      }}>
        {unit}
      </div>
    </div>
  );
}

