import { ChangeEvent } from 'react';

/** Evento compartido por los campos de texto (input o textarea). */
export type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

// Datos Generales
export interface DatosGeneralesData {
  nombre: string;
  fecha: string;
  telefono: string;
  edad: string;
  email: string;
}

// Diagnóstico General (Preguntas Sí/No)
export interface DiagnosticoGeneralData {
  procedimientoCapilar: boolean | null;
  hidratacionReconstruccion: boolean | null;
  planchaSecadoraRizador: boolean | null;
  embarazada: boolean | null;
  alergia: boolean | null;
  problemaHormonal: boolean | null;
  enfermedadRenalRespiratoria: boolean | null;
}

// Tipo de Cabello
export interface TipoCabelloData {
  tipoCabello: string;
  textura: string;
  cueroCabelludo: string;
  opcionImagen: string;
  matriz: {
    poroso: string;
    puntasDanadas: string;
    cabelloAbundante: string;
    seco: string;
    canas: string;
    elasticidad: string;
  };
}

// Problemas Identificados
export interface ProblemasIdentificadosData {
  caida: boolean;
  graso: boolean;
  dermatitis: boolean;
  seborreia: boolean;
  tricotilosis: boolean;
  caspa: boolean;
  tricotilomania: boolean;
  nodos: boolean;
  pediculosis: boolean;
  alopecia: boolean;
  tricorrexis: boolean;
  tiña: boolean;
  nodosa: boolean;
  desf: boolean;
  desg: boolean;
  cuerosensible: boolean;
  prurito: boolean;
  pruritoGravedad: string;
  gravedadAlopecia: string;
  zonaGlabra: string;
  cantidadCabelloDia: string;
  zonasPocaDensidad: string;
  tiempoAlopecia: string;
  familiaresAlopecia: string;
}

// Historial
export interface HistorialData {
  colorOriginal: boolean | null;
  cabelloVirgen: boolean | null;
  procesoQuimico: boolean | null;
  quemado: boolean | null;
  chicloso: boolean | null;
  tinturado: boolean | null;
  decolorado: boolean | null;
}

// Especifique
export interface EspecifiqueData {
  color: string;
  queSeRealizo: string;
  ultimaVez1: string;
  ultimaVez2: string;
}

// Seguimiento
export interface SeguimientoData {
  seguimiento: string;
}

// Cuidado del Cabello
export interface CuidadoCabelloData {
  frecuenciaLavado: string;
  productoUsa: string;
  productoEspecifica: string;
  medidaCabello: string;
}

// Características Generales
export interface CaracteristicasGeneralesData {
  procedimiento: string;
  especialista: string;
  tiempoDuracion: string;
  observaciones: string;
  imagenAntes: string;
  imagenDespues: string;
}

// Productos a usar
export interface ProductoUsoData {
  id: number;
  nombre: string;
  imagen: string;
}

// Cronograma semanal
export interface CronogramaData {
  lunes: string;
  martes: string;
  miercoles: string;
  jueves: string;
  viernes: string;
  sabado: string;
  domingo: string;
  recomendaciones: string;
  modoVisualizacion: 'dias' | 'textoUnico';
  textoUnico: string;
}

// Estado completo de la ficha
export interface FichaTecnicaData {
  datosGenerales: DatosGeneralesData;
  diagnosticoGeneral: DiagnosticoGeneralData;
  tipoCabello: TipoCabelloData;
  problemasIdentificados: ProblemasIdentificadosData;
  historial: HistorialData;
  especifique: EspecifiqueData;
  seguimiento: SeguimientoData;
  cuidadoCabello: CuidadoCabelloData;
  caracteristicasGenerales: CaracteristicasGeneralesData;
  productosUso: ProductoUsoData[];
  cronograma: CronogramaData;
}
