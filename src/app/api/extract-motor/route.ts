import OpenAI from 'openai';
import { motorDocumentOcrSchema, type MotorDocumentOcrResult } from '@/lib/motor-ocr/schema';

export const maxDuration = 60;

interface ExtractMotorRequest {
  imageBase64: string;
  mimeType: string;
}

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType }: ExtractMotorRequest = await request.json();

    if (!imageBase64) {
      return Response.json(
        { error: 'No image provided' },
        { status: 400 },
      );
    }

    const openai = new OpenAI();
    const dataUri = `data:${mimeType};base64,${imageBase64}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 1400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract normalized Philippine motor car insurance / OR-CR data from this document image.

Return ONLY valid JSON with this exact shape:
{
  "documentType": "previous_policy" | "or_cr" | "sales_invoice" | "unknown",
  "confidence": 0.0 to 1.0,
  "fields": {
    "fullName": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "address": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "phone": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "email": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "plateNumber": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "mvFileNumber": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "make": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "model": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "yearModel": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "bodyType": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "color": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "seatingCapacity": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "vehicleUse": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "chassisNumber": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "engineNumber": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "conductionSticker": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "vehicleCondition": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "estimatedMarketValue": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "effectiveDate": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "expiryDate": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "coverageType": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "actsOfNature": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "thirdPartyPropertyDamageLimit": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "autoPersonalAccident": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "deductibleParticipation": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "previousPolicyNumber": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "previousInsurer": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "previousPremium": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" }
  },
  "unmappedText": [],
  "warnings": []
}

Use these mappings:
- registered owner, assured, insured, named insured -> fullName
- owner address, insured address, registered address -> address
- plate no., plate number -> plateNumber
- MV file no., motor vehicle file number -> mvFileNumber
- make / brand -> make
- series / model -> model
- year model -> yearModel
- classification / usage -> vehicleUse
- authorized capacity -> seatingCapacity
- serial no. / chassis no. -> chassisNumber
- motor no. / engine no. -> engineNumber
- fair market value, FMV, sum insured -> estimatedMarketValue
- AON, AOG, acts of god, acts of nature -> actsOfNature
- TPPD, third party property damage -> thirdPartyPropertyDamageLimit
- UPPA, auto personal accident -> autoPersonalAccident
- deductible, participation -> deductibleParticipation

Only include a field if the value is actually visible or strongly implied by labels on the document. Use YYYY-MM-DD for dates when possible. Use numeric strings without currency symbols for money fields when possible. Put uncertain visible text in unmappedText or warnings instead of inventing values.`
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

    const parsed = motorDocumentOcrSchema.safeParse(JSON.parse(content));
    if (!parsed.success) {
      throw new Error(`Motor OCR response did not match schema: ${parsed.error.message}`);
    }

    const extracted: MotorDocumentOcrResult = parsed.data;

    return Response.json({
      success: true,
      data: extracted,
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
