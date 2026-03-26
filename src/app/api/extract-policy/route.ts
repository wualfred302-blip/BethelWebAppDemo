import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { policyOcrSchema, type PolicyOcrData } from '@/lib/policy-ocr-schema';

export const maxDuration = 60;

interface ExtractPolicyRequest {
  imageBase64: string;
  mimeType: string;
}

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType }: ExtractPolicyRequest = await request.json();

    if (!imageBase64) {
      return Response.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const dataUri = `data:${mimeType};base64,${imageBase64}`;

    const textPrompt = `Extract the following information from this CGL (Commercial General Liability) or liability insurance policy document.

Look for:
- Policy Number - the unique policy or certificate number
- Expiry Date - when the policy expires (convert to YYYY-MM-DD format)
- Coverage Limit - the total coverage amount
- Prior Insurer - the name of the insurance company
- Named Insured - the business or person named on the policy
- Business Address - the address of the insured business

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
        schema: policyOcrSchema,
      }),
    });

    if (!output) {
      return Response.json(
        { error: 'Failed to extract policy data - no output' },
        { status: 500 }
      );
    }

    const extracted: PolicyOcrData = output as PolicyOcrData;

    return Response.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    console.error('Policy OCR extraction error:', error);

    return Response.json(
      {
        error: 'Failed to extract policy data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
