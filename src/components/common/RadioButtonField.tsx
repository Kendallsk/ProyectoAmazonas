import { ChangeEvent } from 'react';
import './RadioButtonField.css';

interface RadioButtonFieldProps {
  id: string;
  name: string;
  label: string;
  value: boolean | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const RadioButtonField = ({ name, label, value, onChange }: RadioButtonFieldProps) => {
  return (
    <div className="radio-field">
      <span className="radio-label">{label}</span>
      <div className="radio-options">
        <label className="radio-option">
          <input
            type="radio"
            name={name}
            value="true"
            checked={value === true}
            onChange={onChange}
            className="radio-input"
          />
          Sí
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name={name}
            value="false"
            checked={value === false}
            onChange={onChange}
            className="radio-input"
          />
          No
        </label>
      </div>
    </div>
  );
};

export default RadioButtonField;