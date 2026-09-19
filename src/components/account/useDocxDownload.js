import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function useDocxDownload(contractId, onDownloaded) {
  const [downloading, setDownloading] = useState(false);
  const download = async () => {
    setDownloading(true);
    try {
      const { data } = await base44.functions.invoke('exportContractDocx', { contractId });
      const bytes = Uint8Array.from(atob(data.base64), (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Documento DOCX descargado correctamente');
      onDownloaded?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo generar el documento Word');
    } finally {
      setDownloading(false);
    }
  };
  return { downloading, download };
}