import { 
  Gift, 
  Heart, 
  User, 
  Trophy, 
  GraduationCap, 
  Crown,
  HeartHandshake,
  Smile,
  Sun,
  Ribbon,
  Store,
  Baby
} from 'lucide-react';

export interface Occasion {
  label: string;
  value: string;
  icon: typeof Gift;
  color: string;
  backgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
}

export const occasions: Occasion[] = [
  {
    label: 'Cumpleaños',
    value: 'cumpleanos',
    icon: Gift,
    color: 'from-rose-200 to-pink-300',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeCumpleaños.webp',
    heroTitle: 'Flores para Cumpleaños',
    heroSubtitle: 'Celebra con las flores más hermosas',
    heroDescription: 'Haz que cada cumpleaños sea inolvidable con nuestros arreglos florales especialmente diseñados para celebrar la vida.'
  },
  {
    label: 'Aniversario',
    value: 'aniversario',
    icon: HeartHandshake,
    color: 'from-pink-200 to-rose-300',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeAniversario.webp',
    heroTitle: 'Flores para Aniversario',
    heroSubtitle: 'Celebra el amor que perdura',
    heroDescription: 'Conmemora los momentos especiales de tu relación con arreglos que expresan todo tu amor y cariño.'
  },
  {
    label: 'Amor',
    value: 'amor',
    icon: Heart,
    color: 'from-rose-300 to-pink-400',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeAMor.webp',
    heroTitle: 'Flores de Amor',
    heroSubtitle: 'Expresa tus sentimientos más profundos',
    heroDescription: 'Dile que lo amas con las flores más románticas, perfectas para sorprender a esa persona especial.'
  },
  {
    label: 'Para Él',
    value: 'para-el',
    icon: User,
    color: 'from-pink-100 to-rose-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresparaEl.webp',
    heroTitle: 'Flores para Él',
    heroSubtitle: 'Arreglos masculinos únicos',
    heroDescription: 'Diseños especiales pensados para ellos, con colores y estilos que reflejan fuerza y elegancia.'
  },
  {
    label: 'Pedida de Mano',
    value: 'pedida-mano',
    icon: Crown,
    color: 'from-rose-300 to-pink-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresPedidaDeMano.webp',
    heroTitle: 'Flores para Pedida de Mano',
    heroSubtitle: 'El momento más especial de sus vidas',
    heroDescription: 'Haz que tu propuesta sea perfecta con arreglos florales que acompañen este momento único e irrepetible.'
  },
  {
    label: 'Felicitaciones',
    value: 'felicitaciones',
    icon: Trophy,
    color: 'from-pink-300 to-rose-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresFelicitaciones.webp',
    heroTitle: 'Flores de Felicitaciones',
    heroSubtitle: 'Celebra los logros y éxitos',
    heroDescription: 'Felicita y celebra los logros especiales con arreglos que transmitan alegría y reconocimiento.'
  },
  {
    label: 'Graduación',
    value: 'graduacion',
    icon: GraduationCap,
    color: 'from-rose-200 to-pink-300',
    backgroundImage: '/img/FondosParaOcasiones/FloreParaGraduacion.webp',
    heroTitle: 'Flores para Graduación',
    heroSubtitle: 'Celebra este gran logro académico',
    heroDescription: 'Marca este hito importante con flores que representen el orgullo y la alegría de este gran logro.'
  },
  {
    label: 'Mejórate Pronto',
    value: 'mejorate-pronto',
    icon: Sun,
    color: 'from-pink-200 to-rose-300',
    backgroundImage: '/img/FondosParaOcasiones/FloresMejoratePronto.webp',
    heroTitle: 'Flores para Mejorarse Pronto',
    heroSubtitle: 'Envía buenos deseos y cariño',
    heroDescription: 'Transmite esperanza y buenos deseos con arreglos que alegran el día y dan fuerzas para recuperarse.'
  },
  {
    label: 'Boda',
    value: 'boda',
    icon: HeartHandshake,
    color: 'from-rose-300 to-pink-400',
    backgroundImage: '/img/FondosParaOcasiones/FloresParaBoda.webp',
    heroTitle: 'Flores para Bodas',
    heroSubtitle: 'El día más especial de sus vidas',
    heroDescription: 'Haz de tu boda un cuento de hadas con arreglos florales únicos que hagan de este día algo inolvidable.'
  },
  {
    label: 'Institucional',
    value: 'institucional',
    icon: Crown,
    color: 'from-blue-200 to-indigo-300',
    backgroundImage: '/img/FondosParaOcasiones/FondoInstitucional.png',
    heroTitle: 'Flores Institucionales',
    heroSubtitle: 'Elegancia corporativa y profesional',
    heroDescription: 'Arreglos florales elegantes y sofisticados para eventos corporativos, inauguraciones y celebraciones institucionales.'
  },
  {
    label: 'Inauguraciones',
    value: 'inauguraciones',
    icon: Store,
    color: 'from-purple-200 to-pink-300',
    backgroundImage: '/img/FondosParaOcasiones/inauguracion.webp',
    heroTitle: 'Flores para Inauguraciones',
    heroSubtitle: 'Celebra nuevos comienzos y proyectos',
    heroDescription: 'Arreglos florales elegantes para inauguraciones de negocios, oficinas y locales. Da la bienvenida al éxito con las flores perfectas.'
  },
  {
    label: 'Lágrimas de Piso',
    value: 'lagrimas-piso',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresCondolencias.webp',
    heroTitle: 'Lágrimas de Piso',
    heroSubtitle: 'Arreglos elegantes en el suelo',
    heroDescription: 'Arreglos florales elegantes colocados en el suelo para momentos de duelo y recordación.'
  },
  {
    label: 'Mantos Especiales',
    value: 'mantos-especiales',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresCondolencias.webp',
    heroTitle: 'Mantos Especiales',
    heroSubtitle: 'Coberturas florales únicas',
    heroDescription: 'Coberturas florales con diseños únicos y significativos para honrar y recordar.'
  },
  {
    label: 'Coronas',
    value: 'coronas',
    icon: Crown,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresCondolencias.webp',
    heroTitle: 'Coronas',
    heroSubtitle: 'Coronas tradicionales',
    heroDescription: 'Coronas florales tradicionales para honrar y recordar a quienes partieron.'
  },
  {
    label: 'Trípodes',
    value: 'tripodes',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresCondolencias.webp',
    heroTitle: 'Trípodes',
    heroSubtitle: 'Arreglos en trípodes elegantes',
    heroDescription: 'Arreglos florales montados en estructura de trípode para ceremonias especiales.'
  },
  {
    label: 'Solo porque sí',
    value: 'solo-porque-si',
    icon: Smile,
    color: 'from-pink-100 to-rose-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeAMor.webp',
    heroTitle: 'Flores Solo Porque Sí',
    heroSubtitle: 'Los gestos espontáneos son los más hermosos',
    heroDescription: 'Sorprende con un gesto espontáneo de cariño. No necesitas una ocasión especial para alegrar el día de alguien.'
  },
  {
    label: 'Condolencias',
    value: 'condolencias',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-300',
    backgroundImage: '/img/FondosParaOcasiones/FloresCondolencias.webp',
    heroTitle: 'Condolencias',
    heroSubtitle: 'Acompañamos en momentos difíciles',
    heroDescription: 'Expresamos nuestro pésame y apoyo con arreglos florales respetuosos: coronas, ramos, lágrimas de piso y trípodes.'
  },
  {
    label: 'Nacimiento',
    value: 'nacimiento',
    icon: Baby,
    color: 'from-blue-100 to-pink-200',
    backgroundImage: '/img/FondosParaOcasiones/FondoNacimiento.png',
    heroTitle: 'Flores para Nacimiento',
    heroSubtitle: 'Celebra la llegada de una nueva vida',
    heroDescription: 'Dale la bienvenida al nuevo miembro de la familia con hermosos arreglos florales que expresan toda tu alegría.'
  }
];

// Mapeo inverso para URL a ocasiones
export const occasionMapping: Record<string, string> = occasions.reduce((acc, occasion) => {
  acc[occasion.value] = occasion.label;
  return acc;
}, {} as Record<string, string>);

// Lista solo de nombres para selects/filtros
export const occasionNames = [
  'Todas', 
  ...occasions.map(o => o.label)
];

// Función para obtener ocasión por valor
export const getOccasionByValue = (value: string): Occasion | undefined => {
  return occasions.find(o => o.value === value);
};

// Función para obtener ocasión por label
export const getOccasionByLabel = (label: string): Occasion | undefined => {
  return occasions.find(o => o.label === label);
};

// Ocasiones de condolencias separadas
export const condolenciasOccasions: Occasion[] = [
  occasions.find(o => o.value === 'lagrimas-piso')!,
  occasions.find(o => o.value === 'mantos-especiales')!,
  occasions.find(o => o.value === 'coronas')!,
  occasions.find(o => o.value === 'tripodes')!
];

// Ocasiones regulares (sin las subcategorías de condolencias)
export const regularOccasions: Occasion[] = occasions.filter(o => 
  !['lagrimas-piso', 'mantos-especiales', 'coronas', 'tripodes'].includes(o.value)
);
