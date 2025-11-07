import { ChevronUp, ChevronDown } from 'lucide-react';

interface NumberInputWithArrowsProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  placeholder?: string;
}

export default function NumberInputWithArrows({ 
  value, 
  onChange, 
  min = 0, 
  max = 50, 
  label,
  placeholder 
}: NumberInputWithArrowsProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(min);
      return;
    }
    const newValue = parseInt(inputValue);
    if (isNaN(newValue)) {
      onChange(min);
      return;
    }
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  return (
    <div className="form-group" style={{ flex: 1 }}>
      <label className="form-label">{label}</label>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input
          type="number"
          className="form-input"
          value={value || ''}
          onChange={handleInputChange}
          min={min}
          max={max}
          placeholder={placeholder}
          style={{
            paddingLeft: '3rem',
            textAlign: 'center',
            fontSize: '1rem',
            fontWeight: 600,
            color: '#002147'
          }}
        />
        <div style={{
          position: 'absolute',
          right: '0.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            style={{
              background: value >= max ? '#e9ecef' : '#002147',
              color: value >= max ? '#adb5bd' : 'white',
              border: 'none',
              borderRadius: '0.25rem',
              width: '24px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value >= max ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              if (value < max) {
                e.currentTarget.style.background = '#003366';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (value < max) {
                e.currentTarget.style.background = '#002147';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            style={{
              background: value <= min ? '#e9ecef' : '#002147',
              color: value <= min ? '#adb5bd' : 'white',
              border: 'none',
              borderRadius: '0.25rem',
              width: '24px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: value <= min ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              padding: 0
            }}
            onMouseEnter={(e) => {
              if (value > min) {
                e.currentTarget.style.background = '#003366';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (value > min) {
                e.currentTarget.style.background = '#002147';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

