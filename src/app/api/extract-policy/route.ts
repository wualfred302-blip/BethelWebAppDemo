import OpenAI from 'openai';
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

    const openai = new OpenAI();
    const dataUri = `data:${mimeType};base64,${imageBase64}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the following information from this CGL (Commercial General Liability) insurance policy document.

Return JSON with these exact keys:
- policyNumber - the unique policy or certificate number
- expiryDate - when the policy expires in YYYY-MM-DD format
- coverageLimit - the total coverage amount (as string)
- priorInsurer - the name of the previous insurance company
- namedInsured - the business or person named on the policy
- businessAddress - the address of the insured business

Return ONLY valid JSON. If a field cannot be found, use an empty string.`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUri,
                detail: 'high',
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content');
    }

    const extracted: PolicyOcrData = JSON.parse(content);

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
