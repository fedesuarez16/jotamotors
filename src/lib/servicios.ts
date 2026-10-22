export interface CategoriaServicio {
  categoria: string;
  servicios: string[];
}

export const CATALOGO_SERVICIOS: CategoriaServicio[] = [
  {
    categoria: "Lubricación y mantenimiento de motor",
    servicios: [
      "Cambio de aceite de motor según especificación del fabricante",
      "Cambio de filtro de aceite",
      "Cambio de filtro de aire",
      "Cambio de filtro de combustible diésel y bencina",
      "Cambio de filtro de polen o habitáculo",
      "Mantención preventiva por kilometraje",
      "Cambio de bujías y revisión del sistema de encendido",
      "Limpieza de cuerpo de aceleración y admisión",
      "Cambio de refrigerante y revisión del sistema de refrigeración",
      "Cambio de correas, tensores y kit de distribución",
      "Revisión y reparación de fugas de aceite y refrigerante",
      "Cambio de soportes de motor y caja",
      "Diagnóstico de motor con escáner",
    ],
  },
  {
    categoria: "Frenos",
    servicios: [
      "Revisión y diagnóstico del sistema de frenos",
      "Cambio de pastillas delanteras y traseras",
      "Cambio de discos delanteros y traseros",
      "Rectificación de discos y tambores",
      "Cambio de balatas y cilindros de freno",
      "Mantención y reparación de cálipers",
      "Cambio de líquido de frenos y purga",
      "Cambio de flexibles y cañerías de freno",
      "Cambio de bomba de frenos y servofreno",
      "Regulación y reparación de freno de estacionamiento",
      "Diagnóstico del sistema ABS y cambio de sensores",
    ],
  },
  {
    categoria: "Tren delantero, suspensión y dirección",
    servicios: [
      "Diagnóstico y revisión de tren delantero",
      "Reparación de tren delantero",
      "Cambio de bandejas delanteras",
      "Cambio de bujes de bandejas",
      "Cambio de rótulas de suspensión",
      "Cambio de amortiguadores delanteros",
      "Cambio de amortiguadores traseros",
      "Cambio de cazoletas y rodamientos de amortiguadores",
      "Cambio de topes y guardapolvos de amortiguadores",
      "Cambio de espirales de suspensión",
      "Cambio de bieletas",
      "Cambio de bujes de barra estabilizadora",
      "Cambio de terminales de dirección",
      "Cambio de terminales axiales",
      "Cambio de fuelles de dirección",
      "Cambio de cremallera de dirección",
      "Cambio de bomba de dirección hidráulica",
      "Cambio de mangueras de dirección hidráulica",
      "Cambio de líquido de dirección hidráulica",
      "Diagnóstico de dirección eléctrica",
      "Cambio de rodamientos de rueda",
      "Cambio de mazas de rueda",
      "Alineación de dirección",
      "Balanceo de ruedas",
    ],
  },
];

/** Minúsculas y sin tildes, para que "calipers" encuentre "cálipers". */
export function normalizar(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/** Filtra por todas las palabras escritas (en cualquier orden), en servicio o categoría. */
export function filtrarServicios(q: string): CategoriaServicio[] {
  const palabras = normalizar(q).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return CATALOGO_SERVICIOS;
  return CATALOGO_SERVICIOS.map(({ categoria, servicios }) => ({
    categoria,
    servicios: servicios.filter((s) => {
      const texto = normalizar(`${s} ${categoria}`);
      return palabras.every((p) => texto.includes(p));
    }),
  })).filter((c) => c.servicios.length > 0);
}
