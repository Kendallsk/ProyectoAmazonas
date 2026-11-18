import { ChangeEvent } from 'react';
import InputField from '../../common/InputField';
import { DatosGeneralesData } from '../types';
import './DatosGenerales.css';

interface DatosGeneralesProps {
  data: DatosGeneralesData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const DatosGenerales = ({ data, onChange }: DatosGeneralesProps) => {
  const leftFields = [
    { id: 'nombre', name: 'nombre' as const, label: 'Nombre:', type: 'text', placeholder: '______' },
    { id: 'telefono', name: 'telefono' as const, label: 'Teléfono:', type: 'tel', placeholder: '______' },
  ];

  const rightFields = [
    { id: 'fecha', name: 'fecha' as const, label: 'Fecha:', type: 'date' },
    { id: 'edad', name: 'edad' as const, label: 'Edad:', type: 'number', placeholder: '______' },
  ];

  return (
    <div className="datos-generales">
      <h2 className="section-title">DATOS GENERALES</h2>
      
      <div className="datos-columns">
        <div className="datos-column">
          {leftFields.map((field) => (
            <InputField
              key={field.id}
              id={field.id}
              name={field.name}
              label={field.label}
              type={field.type}
              value={data[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
            />
          ))}
        </div>

        <div className="datos-column">
          {rightFields.map((field) => (
            <InputField
              key={field.id}
              id={field.id}
              name={field.name}
              label={field.label}
              type={field.type}
              value={data[field.name]}
              onChange={onChange}
              placeholder={field.placeholder}
            />
          ))}
        </div>
      </div>

      <div className="datos-full-width">
        <InputField
          id="email"
          name="email"
          label="Correo electrónico:"
          type="email"
          value={data.email}
          onChange={onChange}
          placeholder="______"
        />
      </div>
    </div>
  );
};

export default DatosGenerales;