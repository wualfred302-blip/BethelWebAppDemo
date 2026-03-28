import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { businessPermitOcrSchema, type BusinessPermitOcrData } from '@/lib/ocr-schema';

export const maxDuration = 60;

interface ExtractPermitRequest {
  imageBase64: string;
  mimeType: string;
}

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType }: ExtractPermitRequest = await request.json();

    if (!imageBase64) {
      return Response.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const dataUri = `data:${mimeType};base64,${imageBase64}`;

    const textPrompt = `Extract the following information from this business permit image. The image shows a Philippines business permit/registration document.

Look for:
- TIN (Tax Identification Number) - typically 13 digits in format XXX-XXX-XXX-XXX
- Business Name - the registered name of the business
- Owner's Full Name - the person or entity owning the business
- Complete address including street, barangay, city, province, region
- Permit Issue Date or Effective Date - the date the permit was issued or becomes effective. Return in YYYY-MM-DD format. If no date is found, return empty string.

If a field cannot be found or is unclear, return an empty string for that field.`;

    const { output } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: [
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            { type: 'image', image: dataUri },
          ],
        },
      ],
      output: Output.object({
        schema: businessPermitOcrSchema,
      }),
    });

    if (!output) {
      return Response.json(
        { error: 'Failed to extract permit data - no output' },
        { status: 500 }
      );
    }

    const extracted: BusinessPermitOcrData = output as BusinessPermitOcrData;

    return Response.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    console.error('OCR extraction error:', error);

    return Response.json(
      {
        error: 'Failed to extract permit data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}