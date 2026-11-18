import { RefObject } from 'react';
import './ExportPDFButton.css';

interface ExportPDFButtonProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

const ExportPDFButton = ({ contentRef }: ExportPDFButtonProps) => {
  const generatePdf = () => {
    if (!contentRef.current) return;
    window.print();
  };

  return (
    <div className="export-pdf-container">
      <button type="button" onClick={generatePdf} className="export-pdf-btn">
        📄 Guardar PDF
      </button>
    </div>
  );
};

export default ExportPDFButton;
