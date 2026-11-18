import { ChangeEvent, useRef } from 'react';
import AutoTextarea from '../../common/AutoTextarea';
import { readImageAsDataUrl } from '../../../lib/images';
import { CaracteristicasGeneralesData } from '../types';
import './CaracteristicasGenerales.css';

interface CaracteristicasGeneralesProps {
  data: CaracteristicasGeneralesData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CaracteristicasGenerales = ({ data, onChange }: CaracteristicasGeneralesProps) => {
  const inputAntesRef = useRef<HTMLInputElement>(null);
  const inputDespuesRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e);

  const handleImageClick = (tipo: 'antes' | 'despues') => {
    if (tipo === 'antes') inputAntesRef.current?.click();
    else inputDespuesRef.current?.click();
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>, tipo: 'antes' | 'despues') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = await readImageAsDataUrl(file);
    onChange({
      target: {
        name: tipo === 'antes' ? 'imagenAntes' : 'imagenDespues',
        value: imageUrl
      }
    } as ChangeEvent<HTMLInputElement>);
    e.target.value = '';
  };

  const campos = [
    { id: 'procedimiento', label: 'Procedimiento a realizar:', placeholder: '______' },
    { id: 'especialista', label: 'Especialista:', placeholder: '______' },
    { id: 'tiempoDuracion', label: 'Tiempo de duración:', placeholder: '______' },
  ];

  return (
    <div className="caracteristicas-generales">
      <h2 className="section-title">CARACTERÍSTICAS GENERALES</h2>

      <div className="caracteristicas-grid">
        {/* Columna Izquierda: Campos */}
        <div className="caracteristicas-campos">
          {campos.map((campo) => (
            <div key={campo.id} className="caracteristicas-campo">
              <label htmlFor={campo.id} className="caracteristicas-label">
                {campo.label}
              </label>
              <AutoTextarea
                id={campo.id}
                name={campo.id}
                value={data[campo.id as keyof CaracteristicasGeneralesData] as string}
                onChange={handleChange}
                placeholder={campo.placeholder}
                className="caracteristicas-input"
                minHeight={40}
              />
            </div>
          ))}

          <div className="caracteristicas-campo">
            <label htmlFor="observaciones" className="caracteristicas-label">
              Observaciones:
            </label>
            <AutoTextarea
              id="observaciones"
              name="observaciones"
              value={data.observaciones}
              onChange={handleChange}
              placeholder="______"
              className="caracteristicas-input caracteristicas-textarea"
              minHeight={72}
            />
          </div>
        </div>

        {/* Columna Derecha: Imágenes */}
        <div className="caracteristicas-imagenes">
          {/* Imagen Antes */}
          <div className="caracteristicas-imagen-container">
            <div
              className="caracteristicas-imagen-box"
              onClick={() => handleImageClick('antes')}
            >
              {data.imagenAntes ? (
                <img src={data.imagenAntes} alt="Antes" className="caracteristicas-imagen" />
              ) : (
                <div className="caracteristicas-imagen-placeholder">
                  <span className="caracteristicas-imagen-icon">📷</span>
                  <span className="caracteristicas-imagen-texto">ANTES</span>
                  <span className="caracteristicas-imagen-subtexto">Haz clic para subir</span>
                </div>
              )}
            </div>
            <input
              ref={inputAntesRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'antes')}
              style={{ display: 'none' }}
            />
            <span className="caracteristicas-imagen-label">ANTES</span>
          </div>

          {/* Imagen Después */}
          <div className="caracteristicas-imagen-container">
            <div
              className="caracteristicas-imagen-box"
              onClick={() => handleImageClick('despues')}
            >
              {data.imagenDespues ? (
                <img src={data.imagenDespues} alt="Después" className="caracteristicas-imagen" />
              ) : (
                <div className="caracteristicas-imagen-placeholder">
                  <span className="caracteristicas-imagen-icon">📷</span>
                  <span className="caracteristicas-imagen-texto">DESPUÉS</span>
                  <span className="caracteristicas-imagen-subtexto">Haz clic para subir</span>
                </div>
              )}
            </div>
            <input
              ref={inputDespuesRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'despues')}
              style={{ display: 'none' }}
            />
            <span className="caracteristicas-imagen-label">DESPUÉS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaracteristicasGenerales;
