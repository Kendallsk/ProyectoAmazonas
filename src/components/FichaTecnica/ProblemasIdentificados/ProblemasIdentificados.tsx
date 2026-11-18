import { ChangeEvent } from 'react';
import CheckboxField from '../../common/CheckboxField';
import AutoTextarea from '../../common/AutoTextarea';
import { ProblemasIdentificadosData } from '../types';
import './ProblemasIdentificados.css';

interface ProblemasIdentificadosProps {
  data: ProblemasIdentificadosData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPruritoSeverityChange: (value: string) => void;
  onAlopeciaFieldChange: (name: string, value: string) => void;
}

const ProblemasIdentificados = ({
  data,
  onChange,
  onPruritoSeverityChange,
  onAlopeciaFieldChange,
}: ProblemasIdentificadosProps) => {
  const problemas = [
    { id: 'caida', label: 'Caída' },
    { id: 'graso', label: 'Cuero Cabelludo Graso' },
    { id: 'dermatitis', label: 'Dermatitis' },
    { id: 'seborreia', label: 'Seborreia' },
    { id: 'tricotilosis', label: 'Tricoptilosis' },
    { id: 'caspa', label: 'Caspa' },
    { id: 'tricotilomania', label: 'Tricotilomanía' },
    { id: 'nodos', label: 'Nodos' },
    { id: 'pediculosis', label: 'Pediculosis' },
    { id: 'alopecia', label: 'Alopecia' },
    { id: 'prurito', label: 'Prurito' },
    { id: 'cuerosensible', label: 'Cuero sensible' },
    { id: 'tricorrexis', label: 'Tricorrexis' },
    { id: 'tiña', label: 'Tiña' },
    { id: 'nodosa', label: 'Nodosa' },
    { id: 'desf', label: 'Descamacion Fina' },
    { id: 'desg', label: 'Descamacion Gruesa' },
    
  ];

  const severidadOptions = [
    { value: 'leve', label: 'Leve' },
    { value: 'medio', label: 'Medio' },
    { value: 'intenso', label: 'Intenso' },
  ];

  const camposAlopecia = [
    { name: 'zonaGlabra', label: 'Zona glabra (zona)' },
    { name: 'cantidadCabelloDia', label: 'Cantidad de cabello que se cae al día' },
    { name: 'zonasPocaDensidad', label: 'Zonas con poca densidad de cabello' },
    { name: 'tiempoAlopecia', label: 'Tiempo que padece la alopecia' },
    { name: 'familiaresAlopecia', label: 'Familiares con alopecia' },
  ];

  return (
    <div className="problemas-identificados">
      <h2 className="section-title">PROBLEMAS IDENTIFICADOS</h2>
      
      <div className="problemas-grid">
        {problemas.map((problema) => (
          <div key={problema.id} className="problema-item">
            <CheckboxField
              id={problema.id}
              name={problema.id}
              label={problema.label}
              checked={Boolean(data[problema.id as keyof ProblemasIdentificadosData])}
              onChange={onChange}
            />
          </div>
        ))}
      </div>

      {data.alopecia && (
        <div className="alopecia-section">
          <h3 className="alopecia-title">Alopecias</h3>

          <div className="alopecia-fields">
            {camposAlopecia.map((campo) => (
              <div key={campo.name} className="alopecia-field">
                <label htmlFor={campo.name}>{campo.label}:</label>
                <AutoTextarea
                  id={campo.name}
                  name={campo.name}
                  value={(data[campo.name as keyof ProblemasIdentificadosData] as string) ?? ''}
                  onChange={(e) => onAlopeciaFieldChange(campo.name, e.target.value)}
                  className="alopecia-input"
                  minHeight={40}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {data.prurito && (
        <div className="alopecia-section">
          <h3 className="alopecia-title">Prurito</h3>
          <label className="alopecia-field">
            <span>Gravedad:</span>
            <select
              value={data.pruritoGravedad}
              onChange={(e) => onPruritoSeverityChange(e.target.value)}
            >
              <option value="">Seleccione</option>
              {severidadOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default ProblemasIdentificados;