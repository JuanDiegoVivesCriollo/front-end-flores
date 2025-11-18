// Interface para el tipo de datos del formulario
interface ProductFormData {
  description: string;
  [key: string]: string | number | boolean | null | undefined;
}

// Función para formatear texto pegado automáticamente
const formatPastedText = (pastedText: string): string => {
  return pastedText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => line.startsWith('-') || line.startsWith('•') ? line : `- ${line}`)
    .join('\n');
};

// Evento onPaste para el textarea de características detalladas
export const handleDescriptionPaste = (
  e: React.ClipboardEvent<HTMLTextAreaElement>,
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>
) => {
  e.preventDefault();
  const pastedText = e.clipboardData.getData('text');
  const formattedText = formatPastedText(pastedText);
  setFormData(prev => ({ ...prev, description: formattedText }));
};

// Componente del textarea simplificado:
/*
<textarea
  value={formData.description}
  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
  onPaste={handleDescriptionPaste}
  rows={8}
  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
  placeholder="Pega tu texto aquí y automáticamente se agregarán los guiones. Ejemplo:&#10;&#10;Ramo con base de 20 girasoles primium &#10;Nubecitas &#10;Follaje verde&#10;Papel decorativo&#10;Lazo decorativo&#10;Tarjeta de cuidado de flores&#10;Sachet de preservante de flores&#10;Tarjeta dedicatoria en sobre"
/>
*/
