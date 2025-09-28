import { 
  Gift, 
  Heart, 
  User, 
  Trophy, 
  GraduationCap, 
  Flower2,
  Crown,
  HeartHandshake,
  Smile,
  Sun,
  Ribbon
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
    label: 'San Valentín',
    value: 'san-valentin',
    icon: Heart,
    color: 'from-pink-300 to-rose-400',
    backgroundImage: '/img/FondosParaOcasiones/FloresSanValentin.webp',
    heroTitle: 'Flores para San Valentín',
    heroSubtitle: 'Celebra el día del amor y la amistad',
    heroDescription: 'Sorprende a tu ser querido con las flores más románticas en el día más especial del año.'
  },
  {
    label: 'Día de la Madre',
    value: 'dia-madre',
    icon: Flower2,
    color: 'from-pink-200 to-rose-300',
    backgroundImage: '/img/FondosParaOcasiones/FloresDiaDeLaMadre.webp',
    heroTitle: 'Flores para el Día de la Madre',
    heroSubtitle: 'Honra a la mujer más importante de tu vida',
    heroDescription: 'Demuestra tu amor y gratitud hacia mamá con los arreglos florales más tiernos y especiales.'
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
  }
];

// Ocasiones de condolencias
export const condolenciasOccasions: Occasion[] = [
  {
    label: 'Lágrimas de Piso',
    value: 'lagrimas-piso',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeCondolencias.webp',
    heroTitle: 'Lágrimas de Piso',
    heroSubtitle: 'Arreglos elegantes en el suelo',
    heroDescription: 'Arreglos florales elegantes colocados en el suelo para momentos de duelo y recordación.'
  },
  {
    label: 'Mantos Especiales',
    value: 'mantos-especiales',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeCondolencias.webp',
    heroTitle: 'Mantos Especiales',
    heroSubtitle: 'Coberturas florales únicas',
    heroDescription: 'Coberturas florales con diseños únicos y significativos para honrar y recordar.'
  },
  {
    label: 'Coronas',
    value: 'coronas',
    icon: Crown,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeCondolencias.webp',
    heroTitle: 'Coronas',
    heroSubtitle: 'Coronas tradicionales',
    heroDescription: 'Coronas florales tradicionales para honrar y recordar a quienes partieron.'
  },
  {
    label: 'Trípodes',
    value: 'tripodes',
    icon: Ribbon,
    color: 'from-gray-100 to-gray-200',
    backgroundImage: '/img/FondosParaOcasiones/FloresDeCondolencias.webp',
    heroTitle: 'Trípodes',
    heroSubtitle: 'Arreglos en trípodes elegantes',
    heroDescription: 'Arreglos florales montados en estructura de trípode para ceremonias especiales.'
  }
];

// Ocasiones regulares (sin condolencias)
export const regularOccasions: Occasion[] = occasions.filter(o => 
  !['lagrimas-piso', 'mantos-especiales', 'coronas', 'tripodes'].includes(o.value)
);

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