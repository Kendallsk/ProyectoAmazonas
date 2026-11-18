import { ChangeEvent } from 'react';
import { DiagnosticoGeneralData } from '../types';
import './DiagnosticoGeneral.css';

interface DiagnosticoGeneralProps {
  data: DiagnosticoGeneralData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const DiagnosticoGeneral = ({ data, onChange }: DiagnosticoGeneralProps) => {
  const preguntas = [
    { id: 'procedimientoCapilar', label: '¿Ha tenido algún procedimiento capilar en los últimos 3 meses?' },
    { id: 'hidratacionReconstruccion', label: '¿Realiza frecuentemente hidratación o reconstrucción?' },
    { id: 'planchaSecadoraRizador', label: '¿Utiliza a menudo plancha, secadora o rizador?' },
    { id: 'embarazada', label: '¿Está embarazada?' },
    { id: 'alergia', label: '¿Tiene algún tipo de alergia?' },
    { id: 'problemaHormonal', label: '¿Tiene algún problema hormonal?' },
    { id: 'enfermedadRenalRespiratoria', label: '¿Padece alguna enfermedad renal o respiratoria, como asma?' },
  ];

  return (
    <div className="diagnostico-general">
      <h2 className="section-title">DIAGNÓSTICO GENERAL</h2>
      
      <div className="diagnostico-container">
        {preguntas.map((pregunta) => (
          <div key={pregunta.id} className="diagnostico-item">
            <span className="diagnostico-pregunta">{pregunta.label}</span>
            <div className="diagnostico-opciones">
              <label className="diagnostico-option">
                <input
                  type="radio"
                  name={pregunta.id}
                  value="true"
                  checked={data[pregunta.id as keyof DiagnosticoGeneralData] === true}
                  onChange={onChange}
                />
                Sí
              </label>
              <label className="diagnostico-option">
                <input
                  type="radio"
                  name={pregunta.id}
                  value="false"
                  checked={data[pregunta.id as keyof DiagnosticoGeneralData] === false}
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

export default DiagnosticoGeneral;