import { ChangeEvent } from 'react';
import './CheckboxField.css';

interface CheckboxFieldProps {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxField = ({ id, name, label, checked, onChange }: CheckboxFieldProps) => {
  return (
    <div className="checkbox-field">
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="checkbox-input"
      />
      <label htmlFor={id} className="checkbox-label">
        {label}
      </label>
    </div>
  );
};

export default CheckboxField;