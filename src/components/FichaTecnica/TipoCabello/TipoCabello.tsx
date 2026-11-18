import { ChangeEvent } from 'react';
import { TipoCabelloData } from '../types';
import cabelloImagen from '../../../img/cabello.png';
import './TipoCabello.css';

interface TipoCabelloProps {
  data: TipoCabelloData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const TipoCabello = ({ data, onChange }: TipoCabelloProps) => {
  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e);

  // Opciones de la imagen de tipos de cabello
  const opcionesImagen = ['1', '2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c'];

  // Características de la matriz
  const caracteristicas = [
    { id: 'poroso', label: 'Poroso' },
    { id: 'puntasDanadas', label: 'Puntas Dañadas' },
    { id: 'cabelloAbundante', label: 'Cabello abundante' },
    { id: 'seco', label: 'Seco' },
    { id: 'canas', label: 'Canas' },
    { id: 'elasticidad', label: 'Elasticidad' },
  ];

  const porcentajes = ['NO', '40%', '60%', '80%', '100%'];

  return (
    <div className="tipo-cabello">
      <h2 className="section-title">DIAGNOSTICO GENERAL</h2>

      {/* FILA 1: TIPO DE CABELLO + TEXTURA + CUERO CABELLUDO */}
      <div className="tipo-fila">
        <div className="tipo-columna">
          <h3 className="subsection-title">TIPO DE CABELLO</h3>
          <div className="tipo-opciones-vertical">
            {['Liso', 'Ondulado', 'Rizado', 'Afro'].map((opcion) => (
              <label key={opcion} className="tipo-radio">
                <input
                  type="radio"
                  name="tipoCabello"
                  value={opcion}
                  checked={data.tipoCabello === opcion}
                  onChange={handleRadioChange}
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>

        <div className="tipo-columna">
          <h3 className="subsection-title">TEXTURA</h3>
          <div className="tipo-opciones-vertical">
            {['Delgado', 'Medio', 'Grueso'].map((opcion) => (
              <label key={opcion} className="tipo-radio">
                <input
                  type="radio"
                  name="textura"
                  value={opcion}
                  checked={data.textura === opcion}
                  onChange={handleRadioChange}
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>

        <div className="tipo-columna">
          <h3 className="subsection-title">CUERO CABELLUDO</h3>
          <div className="tipo-opciones-vertical">
            {['Graso', 'Normal', 'Mixto', 'Seco'].map((opcion) => (
              <label key={opcion} className="tipo-radio">
                <input
                  type="radio"
                  name="cueroCabelludo"
                  value={opcion}
                  checked={data.cueroCabelludo === opcion}
                  onChange={handleRadioChange}
                />
                {opcion}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* FILA 2: Imagen + Matriz en 2 columnas */}
      <div className="tipo-imagen-matriz">
        {/* Columna Izquierda: Imagen y opciones */}
        <div className="tipo-imagen-columna">
          <h3 className="subsection-title">TIPOS DE CABELLO</h3>
          
          {/* Espacio para la imagen */}
          <div className="tipo-imagen-placeholder">
            <img
              src={cabelloImagen}
              alt="Tipos de cabello"
              className="tipo-imagen"
            />
            {/* Si no tienes la imagen, puedes usar un placeholder */}
            {/* <div className="tipo-imagen-placeholder-text">
              [Imagen de tipos de cabello]
              <br />
              1, 2a, 2b, 2c, 3a, 3b, 3c, 4a, 4b, 4c
            </div> */}
          </div>

          {/* Opciones de la imagen (debajo de la imagen) */}
          <div className="tipo-opciones-imagen">
            <h4 className="subsubsection-title">Selecciona tu tipo de cabello:</h4>
            <div className="opciones-imagen-grid">
              {opcionesImagen.map((opcion) => (
                <label key={opcion} className="tipo-imagen-option">
                  <input
                    type="radio"
                    name="opcionImagen"
                    value={opcion}
                    checked={data.opcionImagen === opcion}
                    onChange={handleRadioChange}
                  />
                  {opcion}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Matriz de diagnóstico capilar */}
        <div className="tipo-matriz-columna">
          <h3 className="subsection-title">DIAGNOSTICO CAPILAR</h3>
          
          <div className="matriz-container">
            {/* Encabezado con porcentajes */}
            <div className="matriz-header">
              <div className="matriz-cell matriz-header-cell"></div>
              {porcentajes.map((porc) => (
                <div key={porc} className="matriz-cell matriz-header-cell">
                  {porc}
                </div>
              ))}
            </div>

            {/* Filas de características */}
            {caracteristicas.map((carac) => (
              <div key={carac.id} className="matriz-fila">
                <div className="matriz-cell matriz-label">
                  {carac.label}
                </div>
                {porcentajes.map((porc) => (
                  <div key={`${carac.id}-${porc}`} className="matriz-cell matriz-radio-cell">
                    <input
                      type="radio"
                      name={`matriz.${carac.id}`}
                      value={porc}
                      checked={data.matriz[carac.id as keyof typeof data.matriz] === porc}
                      onChange={handleRadioChange}
                      className="matriz-radio"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipoCabello;