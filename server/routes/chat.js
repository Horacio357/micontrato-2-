import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

const router = Router();

const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';
export const MAX_CHAT_QUERIES_PER_CLIENT = 10;
const CHAT_QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;

export const SUPPORT_EMAIL = 'Admin@micontratos.com';

const LIMIT_REACHED_MESSAGE =
  `Alcanzaste el tope máximo de ${MAX_CHAT_QUERIES_PER_CLIENT} consultas por cliente en el asistente virtual. ` +
  `Por cualquier inconveniente o gestión administrativa, comunicate por correo a **${SUPPORT_EMAIL}**.`;

const SYSTEM_PROMPT = `Sos el asistente virtual exclusivo de soporte de uso de la plataforma **micontratos.com** (Argentina).

REGLA PRINCIPAL Y ESTRICTA DE ALCANCE:
- Respondé ÚNICAMENTE preguntas sobre el funcionamiento específico de la aplicación **micontratos.com** (cómo usarla paso a paso, sus herramientas, formatos, cuenta, pagos, suscripción y firma electrónica).
- NO respondas preguntas ajenas al uso de la plataforma (temas generales, programación, redacción de contratos personalizados fuera del sistema, asesoramiento legal particular sobre casos judiciales o conflictos concretos, ni ningún otro tema externo).
- Si el usuario pregunta algo fuera del funcionamiento específico de **micontratos.com**, o plantea cualquier problema administrativo, de cobros, facturas, reembolsos, recuperación de acceso/contraseña o soporte técnico puntual, respondé amablemente que solo asistís con el funcionamiento de la plataforma y que para resolver problemas administrativos o consultas especiales debe comunicarse por email a **${SUPPORT_EMAIL}**.

CÓMO FUNCIONA ESPECÍFICAMENTE MICONTRATOS.COM:
1. **Generar un contrato**: el usuario entra a "Crear contrato" (/crear), elige la categoría (Inmobiliario, Laboral, Comercial o Civil), selecciona el modelo, indica su provincia/jurisdicción (cubre las 24 jurisdicciones de Argentina) y completa el formulario guiado paso a paso.
2. **Modelos disponibles actualmente en la plataforma**:
   - Locación de Inmueble (Vivienda)
   - Locación Comercial
   - Locación Temporaria Turística
   - Locación de Servicios Profesionales
   - Convenio de Confidencialidad (NDA)
   - Contrato de Mutuo Oneroso
3. **Vista previa y cuenta**: al finalizar el formulario se genera una vista previa protegida (con desenfoque hasta desbloquear). Para pagar y descargar hay que iniciar sesión o crear una cuenta con correo electrónico y contraseña en /login (los contratos creados antes de registrarse se vinculan automáticamente a la cuenta).
4. **Pagos y planes vía Stripe**: se paga de forma segura con tarjeta de crédito o débito por **Stripe** en dos modalidades: **Pago Único por documento** (habilita ese contrato específico) o **Suscripción mensual Plan Pro** (habilita descargas ilimitadas mientras esté activa). El usuario puede gestionar su facturación o dar de baja su suscripción desde **Mi cuenta** (/mi-cuenta). No inventes precios: indicá que el valor vigente se muestra antes de pagar dentro de la app.
5. **Descarga y firma electrónica**: una vez desbloqueado el documento desde /mis-contratos o /mi-cuenta, el usuario puede descargarlo en **Word (.docx editable)** o **PDF oficial para imprimir**, y utilizar la **firma electrónica** (Parte A y Parte B, con DNI, aceptación de términos, fecha/hora, IP y hash SHA-256).
6. **Legales**: los Términos y Condiciones (/terminos) y la Política de Privacidad (/privacidad) se encuentran en el pie de página del sitio.

ESTILO:
- Respondé siempre en español de Argentina (voseo), de manera breve, clara y amable.
- Recordá derivar cualquier problema administrativo o caso no contemplado a **${SUPPORT_EMAIL}**.`;

// Almacén en memoria del cupo por cliente (ventana de 24 h)
const clientQuotaStore = new Map();

export function getClientQuotaKey(req) {
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  const ip = req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  return `anon:${ip}`;
}

export function getClientQuotaStatus(req) {
  if (req.user?.role === 'admin') {
    return { used: 0, remaining: MAX_CHAT_QUERIES_PER_CLIENT, limit: MAX_CHAT_QUERIES_PER_CLIENT, isAdmin: true };
  }
  const key = getClientQuotaKey(req);
  const now = Date.now();
  const entry = clientQuotaStore.get(key);
  if (!entry || entry.expiresAt <= now) {
    return { used: 0, remaining: MAX_CHAT_QUERIES_PER_CLIENT, limit: MAX_CHAT_QUERIES_PER_CLIENT, isAdmin: false };
  }
  const remaining = Math.max(0, MAX_CHAT_QUERIES_PER_CLIENT - entry.count);
  return { used: entry.count, remaining, limit: MAX_CHAT_QUERIES_PER_CLIENT, isAdmin: false };
}

export function consumeClientQuota(req, delta = 1) {
  if (req.user?.role === 'admin') {
    return getClientQuotaStatus(req);
  }
  const key = getClientQuotaKey(req);
  const now = Date.now();
  let entry = clientQuotaStore.get(key);
  if (!entry || entry.expiresAt <= now) {
    entry = { count: 0, expiresAt: now + CHAT_QUOTA_WINDOW_MS };
    if (clientQuotaStore.size > 5000) {
      for (const [k, v] of clientQuotaStore) {
        if (v.expiresAt <= now) clientQuotaStore.delete(k);
      }
    }
  }
  entry.count = Math.max(0, entry.count + delta);
  clientQuotaStore.set(key, entry);
  const remaining = Math.max(0, MAX_CHAT_QUERIES_PER_CLIENT - entry.count);
  return { used: entry.count, remaining, limit: MAX_CHAT_QUERIES_PER_CLIENT, isAdmin: false };
}

export function resetChatQuotaStore() {
  clientQuotaStore.clear();
}

let cachedClient = null;
let cachedApiKey = '';

function getGeminiClient(apiKey) {
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }
  return cachedClient;
}

export function normalizeMessages(rawMessages) {
  if (!Array.isArray(rawMessages)) return [];
  const cleaned = rawMessages
    .filter((m) => m && typeof m.content === 'string' && m.content.trim().length > 0)
    .slice(-20)
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      text: m.content.trim(),
    }));

  const firstUserIdx = cleaned.findIndex((m) => m.role === 'user');
  if (firstUserIdx === -1) return [];
  const trimmed = cleaned.slice(firstUserIdx);

  const merged = [];
  for (const msg of trimmed) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === msg.role) {
      prev.text = `${prev.text}\n${msg.text}`;
    } else {
      merged.push({ ...msg });
    }
  }
  return merged;
}

export function toInteractionSteps(normalizedMessages) {
  return normalizedMessages.map((m) => ({
    type: m.role === 'assistant' ? 'model_output' : 'user_input',
    content: [{ type: 'text', text: m.text }],
  }));
}

function extractGeminiReplyText(interaction) {
  if (typeof interaction?.output_text === 'string' && interaction.output_text.trim()) {
    return interaction.output_text.trim();
  }
  const modelSteps = (interaction?.steps || []).filter((s) => s?.type === 'model_output');
  const lastStep = modelSteps[modelSteps.length - 1];
  const parts = (lastStep?.content || [])
    .filter((c) => c?.type === 'text' && typeof c.text === 'string')
    .map((c) => c.text.trim())
    .filter(Boolean);
  return parts.join('\n').trim();
}

async function generateWithGemini(apiKey, normalizedMessages) {
  const ai = getGeminiClient(apiKey);
  const model = (process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL).trim() || DEFAULT_GEMINI_MODEL;

  const interaction = await ai.interactions.create({
    model,
    system_instruction: SYSTEM_PROMPT,
    input: toInteractionSteps(normalizedMessages),
    store: false,
    generation_config: {
      thinking_level: 'low',
      max_output_tokens: 700,
    },
  });

  return extractGeminiReplyText(interaction);
}

async function generateWithGroqFallback(apiKey, normalizedMessages) {
  const payload = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...normalizedMessages.map((m) => ({ role: m.role, content: m.text })),
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
    throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

router.get('/quota', (req, res) => {
  const status = getClientQuotaStatus(req);
  return res.json({
    used: status.used,
    remaining: status.remaining,
    limit: status.limit,
    limit_reached: !status.isAdmin && status.remaining <= 0,
    support_email: SUPPORT_EMAIL,
  });
});

router.post('/', async (req, res) => {
  try {
    const { messages = [] } = req.body || {};
    const normalized = normalizeMessages(messages);

    if (normalized.length === 0) {
      const status = getClientQuotaStatus(req);
      return res.json({
        role: 'assistant',
        content: `¡Hola! 👋 Soy el asistente de micontratos.com. Puedo ayudarte con dudas sobre el funcionamiento de la plataforma. Por temas administrativos, escribí a **${SUPPORT_EMAIL}**.`,
        used: status.used,
        remaining: status.remaining,
        limit: status.limit,
        limit_reached: !status.isAdmin && status.remaining <= 0,
      });
    }

    const quotaBefore = getClientQuotaStatus(req);
    const userTurnCount = normalized.filter((m) => m.role === 'user').length;
    if (!quotaBefore.isAdmin && (quotaBefore.remaining <= 0 || userTurnCount > MAX_CHAT_QUERIES_PER_CLIENT)) {
      return res.json({
        role: 'assistant',
        content: LIMIT_REACHED_MESSAGE,
        used: MAX_CHAT_QUERIES_PER_CLIENT,
        remaining: 0,
        limit: MAX_CHAT_QUERIES_PER_CLIENT,
        limit_reached: true,
      });
    }

    const geminiApiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    const groqApiKey = (process.env.GROQ_API_KEY || '').trim();

    if (geminiApiKey) {
      try {
        const replyContent = await generateWithGemini(geminiApiKey, normalized);
        const quotaAfter = replyContent ? consumeClientQuota(req, 1) : quotaBefore;
        return res.json({
          role: 'assistant',
          content: replyContent || `No pude generar una respuesta en este momento. Si necesitás asistencia administrativa, escribí a **${SUPPORT_EMAIL}**.`,
          used: quotaAfter.used,
          remaining: quotaAfter.remaining,
          limit: quotaAfter.limit,
          limit_reached: !quotaAfter.isAdmin && quotaAfter.remaining <= 0,
        });
      } catch (geminiErr) {
        console.error('Gemini API Error:', geminiErr?.message || geminiErr);
        return res.json({
          role: 'assistant',
          content: `Hubo un inconveniente temporal al conectar con el asistente de IA. Intentá nuevamente en un instante o comunicate a **${SUPPORT_EMAIL}** para asistencia.`,
          used: quotaBefore.used,
          remaining: quotaBefore.remaining,
          limit: quotaBefore.limit,
          limit_reached: false,
        });
      }
    }

    if (groqApiKey) {
      try {
        const replyContent = await generateWithGroqFallback(groqApiKey, normalized);
        const quotaAfter = replyContent ? consumeClientQuota(req, 1) : quotaBefore;
        return res.json({
          role: 'assistant',
          content: replyContent || `No pude generar una respuesta en este momento. Si necesitás asistencia, escribí a **${SUPPORT_EMAIL}**.`,
          used: quotaAfter.used,
          remaining: quotaAfter.remaining,
          limit: quotaAfter.limit,
          limit_reached: !quotaAfter.isAdmin && quotaAfter.remaining <= 0,
        });
      } catch (groqErr) {
        console.error('Groq API Error:', groqErr?.message || groqErr);
        return res.json({
          role: 'assistant',
          content: `Hubo un inconveniente temporal al conectar con el asistente de IA. Para asistencia administrativa escribí a **${SUPPORT_EMAIL}**.`,
          used: quotaBefore.used,
          remaining: quotaBefore.remaining,
          limit: quotaBefore.limit,
          limit_reached: false,
        });
      }
    }

    // Sin API key configurada todavía en Railway
    return res.json({
      role: 'assistant',
      content: `¡Hola! 👋 Soy el asistente de micontratos.com. Puedo ayudarte con el funcionamiento de la plataforma, o podés comunicarte por temas administrativos a **${SUPPORT_EMAIL}**.`,
      used: quotaBefore.used,
      remaining: quotaBefore.remaining,
      limit: quotaBefore.limit,
      limit_reached: false,
    });
  } catch (error) {
    console.error('Error en /api/chat:', error);
    return res.status(500).json({
      role: 'assistant',
      content: `Ocurrió un error al procesar tu consulta. Para asistencia administrativa escribí a ${SUPPORT_EMAIL}.`,
    });
  }
});

export default router;
