import { ChangeEvent } from 'react';
import AutoTextarea from '../../common/AutoTextarea';
import { SeguimientoData } from '../types';
import './Seguimiento.css';

interface SeguimientoProps {
  data: SeguimientoData;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
}

const Seguimiento = ({ data, onChange }: SeguimientoProps) => (
  <div className="seguimiento">
    <h2 className="section-title">SEGUIMIENTO</h2>

    <div className="seguimiento-container">
      <AutoTextarea
        id="seguimiento"
        name="seguimiento"
        value={data.seguimiento || ''}
        onChange={onChange}
        className="seguimiento-textarea"
        placeholder="______"
        minHeight={350}
      />
    </div>
  </div>
);

export default Seguimiento;
