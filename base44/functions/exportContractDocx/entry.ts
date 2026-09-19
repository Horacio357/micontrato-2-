import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { AlignmentType, Document, Footer, PageNumber, Packer, Paragraph, TextRun } from 'npm:docx@9.5.1';

const runsFor = (text, bold = false) => String(text).split('\n').map((line, index) => new TextRun({ text: line, bold, size: bold ? 24 : 22, font: 'Times New Roman', break: index ? 1 : 0 }));

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { contractId } = await req.json();
    if (!contractId) return Response.json({ error: 'Falta contractId' }, { status: 400 });

    const [contract] = await base44.entities.GeneratedContract.filter({ id: contractId });
    if (!contract) return Response.json({ error: 'Contrato no encontrado' }, { status: 404 });

    let source = contract.generated_text || '';
    if (source.startsWith('http')) {
      const response = await fetch(source);
      if (!response.ok) throw new Error('No se pudo leer el documento generado');
      source = await response.text();
    }

    // El texto guardado es la fuente literal; no regenerar ni reescribir cláusulas.
    let text = source;
    try {
      const parsed = JSON.parse(source);
      text = typeof parsed.text === 'string' ? parsed.text : (parsed.blocks || []).map((block) => block.content).join('\n\n');
    } catch {
      // Documentos anteriores almacenados como texto plano.
    }
    if (!text.trim()) return Response.json({ error: 'El contrato todavía no tiene contenido' }, { status: 409 });
    text = text.replace(/^\[CENTRAR\]/, '');
    // Separar visualmente el título también en documentos anteriores, sin cambiar palabras.
    const lines = text.split(/\r?\n/);
    const firstLine = lines[0].trim();
    const hasTitle = firstLine.length < 100 && firstLine === firstLine.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(firstLine);
    const paragraphs = lines.map((line, index) => new Paragraph({
      children: runsFor(line, index === 0 && hasTitle),
      alignment: index === 0 && hasTitle ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { line: 360, after: 0 },
      keepNext: index === 0 && hasTitle,
      widowControl: true,
    }));

    const doc = new Document({ sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1985, right: 1418, bottom: 1701, left: 1701 },
        },
      },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Página ', font: 'Times New Roman', size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 18 })] })] }) },
      children: paragraphs,
    }] });

    const base64 = await Packer.toBase64String(doc);
    const safeName = (contract.template_name || 'contrato').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ _-]/g, '').trim() || 'contrato';
    return Response.json({ base64, filename: `${safeName}.docx` });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}