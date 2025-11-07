interface TimePickerProps {
  hour: number;
  minute: number;
  ampm: 'AM' | 'PM';
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
  onAmpmChange: (ampm: 'AM' | 'PM') => void;
}

export default function TimePicker({ hour, minute, ampm, onHourChange, onMinuteChange, onAmpmChange }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      {/* Hours */}
      <div style={{ flex: 1 }}>
        <label style={{
          display: 'block',
          fontSize: '0.75rem',
          color: '#6c757d',
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          الساعة
        </label>
        <select
          className="form-select"
          value={hour}
          onChange={(e) => onHourChange(Number(e.target.value))}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            textAlign: 'center',
            fontWeight: 600,
            color: '#002147',
            width: '100%'
          }}
        >
          {hours.map(h => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </div>

      {/* Minutes */}
      <div style={{ flex: 1 }}>
        <label style={{
          display: 'block',
          fontSize: '0.75rem',
          color: '#6c757d',
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          الدقائق
        </label>
        <select
          className="form-select"
          value={minute}
          onChange={(e) => onMinuteChange(Number(e.target.value))}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            textAlign: 'center',
            fontWeight: 600,
            color: '#002147',
            width: '100%'
          }}
        >
          {minutes.map(m => (
            <option key={m} value={m}>
              {String(m).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      {/* AM/PM */}
      <div style={{ flex: 1 }}>
        <label style={{
          display: 'block',
          fontSize: '0.75rem',
          color: '#6c757d',
          fontWeight: 600,
          marginBottom: '0.5rem'
        }}>
          الفترة
        </label>
        <select
          className="form-select"
          value={ampm}
          onChange={(e) => onAmpmChange(e.target.value as 'AM' | 'PM')}
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            textAlign: 'center',
            fontWeight: 600,
            color: '#002147',
            width: '100%'
          }}
        >
          <option value="AM">ص</option>
          <option value="PM">م</option>
        </select>
      </div>
    </div>
  );
}

