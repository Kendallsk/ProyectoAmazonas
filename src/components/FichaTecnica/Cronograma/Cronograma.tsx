import { ChangeEvent } from 'react';
import AutoTextarea from '../../common/AutoTextarea';
import { CronogramaData } from '../types';
import './Cronograma.css';

interface CronogramaProps {
  data: CronogramaData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Cronograma = ({ data, onChange }: CronogramaProps) => {
  const dias = [
    { id: 'lunes', label: 'LUNES' },
    { id: 'martes', label: 'MARTES' },
    { id: 'miercoles', label: 'MIÉRCOLES' },
    { id: 'jueves', label: 'JUEVES' },
    { id: 'viernes', label: 'VIERNES' },
    { id: 'sabado', label: 'SÁBADO' },
    { id: 'domingo', label: 'DOMINGO' },
    { id: 'recomendaciones', label: 'RECOMENDACIONES' },
  ];

  const handleModeChange = (value: 'dias' | 'textoUnico') => {
    onChange({
      target: {
        name: 'modoVisualizacion',
        value,
      }
    } as ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="cronograma">
      <h2 className="section-title">CRONOGRAMA SEMANAL</h2>
      <p className="cronograma-subtitle">Rutina de cuidado capilar</p>

      <div className="cronograma-selector">
        <label className="cronograma-option">
          <input
            type="radio"
            name="modoVisualizacion"
            checked={data.modoVisualizacion === 'dias'}
            onChange={() => handleModeChange('dias')}
          />
          <span>Por días</span>
        </label>

        <label className="cronograma-option">
          <input
            type="radio"
            name="modoVisualizacion"
            checked={data.modoVisualizacion === 'textoUnico'}
            onChange={() => handleModeChange('textoUnico')}
          />
          <span>Una sola caja de texto</span>
        </label>
      </div>

      {data.modoVisualizacion === 'textoUnico' ? (
        <div className="cronograma-unica">
          <AutoTextarea
            name="textoUnico"
            value={data.textoUnico}
            onChange={onChange}
            placeholder="Escribe toda la rutina aquí..."
            className="cronograma-textarea cronograma-textarea-unica"
            minHeight={280}
          />
        </div>
      ) : (
        <div className="cronograma-grid">
          {dias.map((dia) => (
            <div key={dia.id} className="cronograma-dia">
              <div className="cronograma-dia-header">
                <span className="cronograma-dia-label">{dia.label}</span>
              </div>
              <AutoTextarea
                name={dia.id}
                value={data[dia.id as keyof CronogramaData] as string}
                onChange={onChange}
                placeholder="Escribe la rutina..."
                className="cronograma-textarea"
                minHeight={150}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cronograma;
