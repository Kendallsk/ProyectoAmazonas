import { ChangeEvent } from 'react';
import { HistorialData } from '../types';
import './Historial.css';

interface HistorialProps {
  data: HistorialData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Historial = ({ data, onChange }: HistorialProps) => {
  const preguntas = [
    { id: 'colorOriginal', label: '¿Color original de cabello?' },
    { id: 'cabelloVirgen', label: '¿Cabello Virgen?' },
    { id: 'procesoQuimico', label: '¿Proceso químico?' },
    { id: 'quemado', label: '¿Quemado?' },
    { id: 'chicloso', label: '¿Chicloso?' },
    { id: 'tinturado', label: '¿Tinturado?' },
    { id: 'decolorado', label: '¿Decolorado?' },
  ];

  return (
    <div className="historial">
      <h2 className="section-title">HISTORIAL</h2>
      
      <div className="historial-container">
        {preguntas.map((pregunta) => (
          <div key={pregunta.id} className="historial-item">
            <span className="historial-pregunta">{pregunta.label}</span>
            <div className="historial-opciones">
              <label className="historial-option">
                <input
                  type="radio"
                  name={pregunta.id}
                  value="true"
                  checked={data[pregunta.id as keyof HistorialData] === true}
                  onChange={onChange}
                />
                Sí
              </label>
              <label className="historial-option">
                <input
                  type="radio"
                  name={pregunta.id}
                  value="false"
                  checked={data[pregunta.id as keyof HistorialData] === false}
                  onChange={onChange}
                />
                No
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Historial;