import { ChangeEvent } from 'react';
import AutoTextarea from '../../common/AutoTextarea';
import { CuidadoCabelloData } from '../types';
import medidasImagen from '../../../img/go.jpg';
import './CuidadoCabello.css';

interface CuidadoCabelloProps {
  data: CuidadoCabelloData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CuidadoCabello = ({ data, onChange }: CuidadoCabelloProps) => {
  const handleFieldChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(e);

  const frecuencias = [
    'Todos los días',
    'Día de por medio',
    '1 vez por semana',
    '2 veces por semana',
    '3 veces por semana',
    'Cada 8 días'
  ];

  const medidas = ['Corto', 'Mediano', 'Largo'];

  return (
    <div className="cuidado-cabello">
      <h2 className="section-title">CUIDADO DEL CABELLO</h2>

      {/* 2 columnas */}
      <div className="cuidado-grid">
        {/* Columna Izquierda */}
        <div className="cuidado-columna-izquierda">
          {/* ¿Cada cuánto se lava el cabello? */}
          <div className="cuidado-seccion">
            <h3 className="subsection-title">¿Cada cuánto se lava el cabello?</h3>
            <div className="cuidado-opciones-vertical">
              {frecuencias.map((frecuencia) => (
                <label key={frecuencia} className="cuidado-radio">
                  <input
                    type="radio"
                    name="frecuenciaLavado"
                    value={frecuencia}
                    checked={data.frecuenciaLavado === frecuencia}
                    onChange={handleFieldChange}
                  />
                  {frecuencia}
                </label>
              ))}
            </div>
          </div>

          {/* ¿Qué producto usa? */}
          <div className="cuidado-seccion">
            <h3 className="subsection-title">¿QUE PRODUCTO USA?</h3>
            <div className="cuidado-producto-inputs">
              <AutoTextarea
                name="productoUsa"
                value={data.productoUsa}
                onChange={handleFieldChange}
                placeholder="______"
                className="cuidado-input"
                minHeight={40}
              />
              <AutoTextarea
                name="productoEspecifica"
                value={data.productoEspecifica}
                onChange={handleFieldChange}
                placeholder="______"
                className="cuidado-input"
                minHeight={40}
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Medida del cabello */}
        <div className="cuidado-columna-derecha">
          <h3 className="subsection-title">MEDIDA DEL CABELLO</h3>
          
          <div className="cuidado-medida-container">
            {/* Opciones en columna (izquierda) */}
            <div className="cuidado-medida-opciones-vertical">
              {medidas.map((medida) => (
                <label key={medida} className="cuidado-medida-option-vertical">
                  <input
                    type="radio"
                    name="medidaCabello"
                    value={medida}
                    checked={data.medidaCabello === medida}
                    onChange={handleFieldChange}
                  />
                  {medida}
                </label>
              ))}
            </div>

            {/* Imagen vertical (derecha) */}
            <div className="cuidado-medida-imagen-vertical">
              <img
                src={medidasImagen}
                alt="Medidas de cabello"
                className="cuidado-imagen-vertical"
              />
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CuidadoCabello;