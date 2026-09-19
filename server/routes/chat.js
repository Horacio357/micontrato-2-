import { Router } from 'express';

const router = Router();

const SYSTEM_PROMPT = `Sos un asistente virtual experto en legislación y contratos de la República Argentina para la plataforma micontrato.com.ar.

Tus funciones son:
1. Orientar amablemente a los usuarios sobre qué tipo de contrato necesitan (alquiler de vivienda, comercial, temporario, mutuo oneroso, convenio de confidencialidad, servicios profesionales).
2. Explicar conceptos legales comunes (garantes, depósito en garantía, plazo de locación, índices de actualización ICL/IPC, etc.) en un lenguaje sencillo y accesible.
3. Responder de forma breve, clara, profesional y en español de Argentina.
4. Recordar al usuario que la plataforma genera contratos estandarizados y jurídicamente auditados en minutos.`;

router.post('/', async (req, res) => {
  try {
    const { messages = [] } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      // Mensaje de respaldo amigable si aún no se ingresó la API Key de Groq en Railway
      return res.json({
        role: 'assistant',
        content: '¡Hola! 👋 Soy el asistente virtual de micontrato.com.ar. ¿En qué contrato o duda legal puedo ayudarte hoy?',
      });
    }

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API Error:', errorText);
      return res.json({
        role: 'assistant',
        content: 'Hubo un inconveniente temporal al conectar con la IA de Groq. ¿Podrías intentar nuevamente en un instante?',
      });
    }

    const data = await response.json();
    const replyContent = data.choices?.[0]?.message?.content || 'No pude generar una respuesta en este momento.';

    return res.json({
      role: 'assistant',
      content: replyContent,
    });
  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      role: 'assistant',
      content: 'Ocurrió un error al procesar tu consulta.',
    });
  }
});

export default router;
