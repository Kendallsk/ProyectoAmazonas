import { ChangeEvent } from 'react';
import AutoTextarea from './AutoTextarea';
import './InputField.css';

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const TEXTAREA_INPUT_MODE: Record<string, 'numeric' | 'tel' | 'email' | 'decimal'> = {
  number: 'numeric',
  tel: 'tel',
  email: 'email',
};

const InputField = ({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder
}: InputFieldProps) => {
  return (
    <div className="input-field-group">
      <label htmlFor={id} className="input-field-label">
        {label}
      </label>

      {type === 'date' ? (
        <input
          id={id}
          type="date"
          name={name}
          value={value}
          onChange={onChange as (e: ChangeEvent<HTMLInputElement>) => void}
          className="input-field-input"
        />
      ) : (
        <AutoTextarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={TEXTAREA_INPUT_MODE[type]}
          className="input-field-input"
          minHeight={40}
        />
      )}
    </div>
  );
};

export default InputField;
