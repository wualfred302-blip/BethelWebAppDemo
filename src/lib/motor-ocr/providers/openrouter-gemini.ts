export const MOTOR_OCR_MODEL = process.env.OPENROUTER_MODEL ?? 'google/gemini-2.5-flash';

type OpenRouterMessagePart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'low' | 'high' | 'auto' } }
  | { type: 'file'; file: { filename: string; file_data: string } };

type OpenRouterRequestBody = {
  model: string;
  temperature: number;
  max_tokens: number;
  response_format?: { type: 'json_object' };
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | OpenRouterMessagePart[];
  }>;
};

function normalizeContent(content: unknown) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (part && typeof part === 'object' && 'text' in part && typeof (part as { text?: unknown }).text === 'string') {
          return (part as { text: string }).text;
        }
        return '';
      })
      .join('');
  }
  return '';
}

export async function generateMotorOcrJsonContent(input: {
  imageBase64: string;
  mimeType: string;
  filename?: string;
  prompt: string;
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const fileDataUrl = `data:${input.mimeType};base64,${input.imageBase64}`;
  const documentPart: OpenRouterMessagePart = input.mimeType === 'application/pdf'
    ? {
        type: 'file',
        file: {
          filename: input.filename ?? 'motor-policy.pdf',
          file_data: fileDataUrl,
        },
      }
    : {
        type: 'image_url',
        image_url: {
          url: fileDataUrl,
          detail: 'high',
        },
      };

  const body: OpenRouterRequestBody = {
    model: MOTOR_OCR_MODEL,
    temperature: 0,
    max_tokens: 8000,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: input.prompt,
          },
          documentPart,
        ],
      },
    ],
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER ?? 'http://localhost:3000',
      'X-Title': process.env.OPENROUTER_APP_TITLE ?? 'Bethel Web App Demo',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      `OpenRouter request failed (${response.status} ${response.statusText})${message ? `: ${message}` : ''}`,
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: unknown;
      };
    }>;
  };

  const content = normalizeContent(payload.choices?.[0]?.message?.content);
  if (!content) {
    throw new Error('OpenRouter response did not include OCR content');
  }

  return content;
}
