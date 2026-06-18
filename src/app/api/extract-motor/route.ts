import { extractMotorDocumentFromImage } from '@/lib/motor-ocr/extract';

export const maxDuration = 60;

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

interface ExtractMotorRequest {
  imageBase64: string;
  mimeType: string;
  filename?: string;
}

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, filename }: ExtractMotorRequest = await request.json();

    if (!imageBase64) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    const resolvedMimeType = mimeType || 'image/jpeg';
    if (!SUPPORTED_MIME_TYPES.has(resolvedMimeType)) {
      return Response.json({ error: 'Unsupported document type' }, { status: 400 });
    }

    const estimatedBytes = Math.ceil((imageBase64.length * 3) / 4);
    if (estimatedBytes > MAX_UPLOAD_BYTES) {
      return Response.json({ error: 'Document must be 5MB or smaller' }, { status: 400 });
    }

    const data = await extractMotorDocumentFromImage({
      imageBase64,
      mimeType: resolvedMimeType,
      filename,
    });

    return Response.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Motor OCR extraction error:', error);

    return Response.json(
      {
        error: 'Failed to extract motor document data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
