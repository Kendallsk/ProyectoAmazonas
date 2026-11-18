import { ChangeEvent } from 'react';
import AutoTextarea from '../../common/AutoTextarea';
import { EspecifiqueData } from '../types';
import './Especifique.css';

interface EspecifiqueProps {
  data: EspecifiqueData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Especifique = ({ data, onChange }: EspecifiqueProps) => {
  const fields = [
    { id: 'color', name: 'color' as const, label: 'COLOR', placeholder: '______' },
    { id: 'queSeRealizo', name: 'queSeRealizo' as const, label: 'Que se realizó', placeholder: '______' },
    { id: 'ultimaVez1', name: 'ultimaVez1' as const, label: '¿Última vez?', placeholder: '______' },
    { id: 'ultimaVez2', name: 'ultimaVez2' as const, label: '¿Última vez?', placeholder: '______' },
  ];

  return (
    <div className="especifique">
      <h2 className="section-title">ESPECIFIQUE</h2>

      <div className="especifique-container">
        {fields.map((field) => (
          <div key={field.id} className="especifique-item">
            <label htmlFor={field.id} className="especifique-label">
              {field.label}
            </label>
            <AutoTextarea
              id={field.id}
              name={field.name}
              value={data[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
              className="especifique-input"
              minHeight={40}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Especifique;
