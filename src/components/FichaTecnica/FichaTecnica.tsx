import { ChangeEvent, useEffect, useRef, useState } from 'react';
import DatosGenerales from './DatosGenerales/DatosGenerales';
import DiagnosticoGeneral from './DiagnosticoGeneral/DiagnosticoGeneral';
import TipoCabello from './TipoCabello/TipoCabello';
import ProblemasIdentificados from './ProblemasIdentificados/ProblemasIdentificados';
import Historial from './Historial/Historial';
import Especifique from './Especifique/Especifique';
import Seguimiento from './Seguimiento/Seguimiento';
import CuidadoCabello from './CuidadoCabello/CuidadoCabello';
import CaracteristicasGenerales from './CaracteristicasGenerales/CaracteristicasGenerales';
import ProductosUso from './ProductosUso/ProductosUso';
import Cronograma from './Cronograma/Cronograma';
import ExportPDFButton from './ExportPDFButton/ExportPDFButton';
import { FieldChangeEvent, FichaTecnicaData } from './types';
import { clearFicha, loadFicha, saveFicha } from '../../lib/storage';
import './FichaTecnica.css';

const createEmptyFicha = (): FichaTecnicaData => ({
  datosGenerales: {
    nombre: '',
    fecha: '',
    telefono: '',
    edad: '',
    email: '',
  },
  diagnosticoGeneral: {
    procedimientoCapilar: null,
    hidratacionReconstruccion: null,
    planchaSecadoraRizador: null,
    embarazada: null,
    alergia: null,
    problemaHormonal: null,
    enfermedadRenalRespiratoria: null,
  },
  tipoCabello: {
    tipoCabello: '',
    textura: '',
    cueroCabelludo: '',
    opcionImagen: '',
    matriz: {
      poroso: '',
      puntasDanadas: '',
      cabelloAbundante: '',
      seco: '',
      canas: '',
      elasticidad: '',
    },
  },
  problemasIdentificados: {
    caida: false,
    graso: false,
    dermatitis: false,
    seborreia: false,
    tricotilosis: false,
    caspa: false,
    tricotilomania: false,
    nodos: false,
    pediculosis: false,
    alopecia: false,
    tricorrexis: false,
    tiña: false,
    nodosa: false,
    desf: false,
    desg: false,
    prurito: false,
    cuerosensible: false,
    pruritoGravedad: '',
    gravedadAlopecia: '',
    zonaGlabra: '',
    cantidadCabelloDia: '',
    zonasPocaDensidad: '',
    tiempoAlopecia: '',
    familiaresAlopecia: '',
  },
  historial: {
    colorOriginal: null,
    cabelloVirgen: null,
    procesoQuimico: null,
    quemado: null,
    chicloso: null,
    tinturado: null,
    decolorado: null,
  },
  especifique: {
    color: '',
    queSeRealizo: '',
    ultimaVez1: '',
    ultimaVez2: '',
  },
  seguimiento: {
    seguimiento: '',
  },
  cuidadoCabello: {
    frecuenciaLavado: '',
    productoUsa: '',
    productoEspecifica: '',
    medidaCabello: '',
  },
  caracteristicasGenerales: {
    procedimiento: '',
    especialista: '',
    tiempoDuracion: '',
    observaciones: '',
    imagenAntes: '',
    imagenDespues: '',
  },
  productosUso: [{ id: Date.now(), nombre: '', imagen: '' }],
  cronograma: {
    lunes: '',
    martes: '',
    miercoles: '',
    jueves: '',
    viernes: '',
    sabado: '',
    domingo: '',
    recomendaciones: '',
    modoVisualizacion: 'dias',
    textoUnico: '',
  },
});

type SaveStatus = 'inicial' | 'guardando' | 'ok' | 'parcial' | 'error';

const SAVE_DELAY = 400;

const FichaTecnica = ({ onBack }: { onBack?: () => void }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const [fichaData, setFichaData] = useState<FichaTecnicaData>(() =>
    loadFicha(createEmptyFicha)
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('inicial');
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dataRef = useRef(fichaData);

  useEffect(() => {
    dataRef.current = fichaData;
  }, [fichaData]);

  // Guardado automático (debounce) ante cada cambio
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaveStatus('guardando');
      setSaveStatus(saveFicha(fichaData));
      setSavedAt(new Date());
    }, SAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [fichaData]);

  // Guardado inmediato al suspender, cambiar de pestaña o cerrar la ventana
  useEffect(() => {
    const flush = () => {
      setSaveStatus(saveFicha(dataRef.current));
      setSavedAt(new Date());
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const handleDatosGeneralesChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      datosGenerales: { ...prev.datosGenerales, [name]: value },
    }));
  };

  const handleDiagnosticoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      diagnosticoGeneral: { ...prev.diagnosticoGeneral, [name]: value === 'true' },
    }));
  };

  const handleTipoCabelloChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFichaData(prev => ({
        ...prev,
        tipoCabello: {
          ...prev.tipoCabello,
          [parent]: {
            ...(prev.tipoCabello[parent as keyof typeof prev.tipoCabello] as Record<string, string>),
            [child]: value,
          },
        },
      }));
    } else {
      setFichaData(prev => ({
        ...prev,
        tipoCabello: {
          ...prev.tipoCabello,
          [name]: type === 'checkbox' ? checked : value,
        },
      }));
    }
  };

  const handleCuidadoCabelloChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      cuidadoCabello: { ...prev.cuidadoCabello, [name]: value },
    }));
  };

  const handleCaracteristicasGeneralesChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      caracteristicasGenerales: { ...prev.caracteristicasGenerales, [name]: value },
    }));
  };

  const handleCronogramaChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      cronograma: { ...prev.cronograma, [name]: value },
    }));
  };

  const handleHistorialChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      historial: { ...prev.historial, [name]: value === 'true' },
    }));
  };

  const handleEspecifiqueChange = (e: FieldChangeEvent) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      especifique: { ...prev.especifique, [name]: value },
    }));
  };

  const handleSeguimientoChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFichaData(prev => ({
      ...prev,
      seguimiento: { ...prev.seguimiento, [name]: value },
    }));
  };

  const handleProblemasChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFichaData(prev => ({
      ...prev,
      problemasIdentificados: {
        ...prev.problemasIdentificados,
        [name]: checked,
        ...(name === 'alopecia' && !checked
          ? {
              gravedadAlopecia: '',
              zonaGlabra: '',
              cantidadCabelloDia: '',
              zonasPocaDensidad: '',
              tiempoAlopecia: '',
              familiaresAlopecia: '',
            }
          : {}),
        ...(name === 'prurito' && !checked ? { pruritoGravedad: '' } : {}),
      },
    }));
  };

  const handlePruritoSeverityChange = (value: string) => {
    setFichaData(prev => ({
      ...prev,
      problemasIdentificados: { ...prev.problemasIdentificados, pruritoGravedad: value },
    }));
  };

  const handleAlopeciaFieldChange = (name: string, value: string) => {
    setFichaData(prev => ({
      ...prev,
      problemasIdentificados: { ...prev.problemasIdentificados, [name]: value },
    }));
  };

  const handleAddProducto = () => {
    setFichaData(prev => ({
      ...prev,
      productosUso: [
        ...prev.productosUso,
        { id: Date.now() + Math.random(), nombre: '', imagen: '' },
      ],
    }));
  };

  const handleRemoveProducto = (id: number) => {
    setFichaData(prev => ({
      ...prev,
      productosUso: prev.productosUso.filter(producto => producto.id !== id),
    }));
  };

  const handleProductoChange = (id: number, field: 'nombre' | 'imagen', value: string) => {
    setFichaData(prev => ({
      ...prev,
      productosUso: prev.productosUso.map(producto =>
        producto.id === id ? { ...producto, [field]: value } : producto
      ),
    }));
  };

  const handleNuevaFicha = () => {
    const hayContenido =
      Boolean(dataRef.current.datosGenerales.nombre) ||
      Boolean(dataRef.current.seguimiento.seguimiento);

    if (
      hayContenido &&
      !window.confirm('Se borrarán los datos cargados para empezar una ficha nueva. ¿Continuar?')
    ) {
      return;
    }

    clearFicha();
    setFichaData(createEmptyFicha());
    setSaveStatus('inicial');
    setSavedAt(null);
  };

  const saveLabel = (() => {
    switch (saveStatus) {
      case 'guardando':
        return 'Guardando…';
      case 'ok':
        return savedAt
          ? `Guardado a las ${savedAt.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
          : 'Guardado';
      case 'parcial':
        return 'Guardado solo el texto: no hay espacio para las fotos';
      case 'error':
        return 'No se pudo guardar en este equipo';
      default:
        return 'Guardado automático activo';
    }
  })();

  return (
    <div className="ficha-container">
      <div ref={contentRef} className="ficha-card">
        <div className="ficha-header">
          <h1 className="ficha-title">FICHA TÉCNICA</h1>

          <div className="ficha-toolbar">
            <span
              className={`ficha-save ficha-save--${saveStatus}`}
              role="status"
              aria-live="polite"
            >
              {saveLabel}
            </span>
            <button type="button" className="ficha-toolbar-btn" onClick={handleNuevaFicha}>
              Nueva ficha
            </button>
            {onBack && <button type="button" className="ficha-toolbar-btn ficha-back-btn" onClick={onBack}>Volver a la peluquería</button>}
          </div>
        </div>

        <DatosGenerales
          data={fichaData.datosGenerales}
          onChange={handleDatosGeneralesChange}
        />

        <div className="ficha-diagnostico-problemas">
          <DiagnosticoGeneral
            data={fichaData.diagnosticoGeneral}
            onChange={handleDiagnosticoChange}
          />
          <ProblemasIdentificados
            data={fichaData.problemasIdentificados}
            onChange={handleProblemasChange}
            onPruritoSeverityChange={handlePruritoSeverityChange}
            onAlopeciaFieldChange={handleAlopeciaFieldChange}
          />
        </div>

        <TipoCabello data={fichaData.tipoCabello} onChange={handleTipoCabelloChange} />

        <CuidadoCabello data={fichaData.cuidadoCabello} onChange={handleCuidadoCabelloChange} />

        <div className="ficha-historial-seguimiento">
          <div className="ficha-historial-especifique">
            <Historial data={fichaData.historial} onChange={handleHistorialChange} />
            <Especifique data={fichaData.especifique} onChange={handleEspecifiqueChange} />
          </div>
          <Seguimiento data={fichaData.seguimiento} onChange={handleSeguimientoChange} />
        </div>

        <CaracteristicasGenerales
          data={fichaData.caracteristicasGenerales}
          onChange={handleCaracteristicasGeneralesChange}
        />

        <ProductosUso
          productos={fichaData.productosUso}
          onAddProducto={handleAddProducto}
          onRemoveProducto={handleRemoveProducto}
          onProductoChange={handleProductoChange}
        />

        <Cronograma data={fichaData.cronograma} onChange={handleCronogramaChange} />
        <ExportPDFButton contentRef={contentRef} />
      </div>
    </div>
  );
};

export default FichaTecnica;
