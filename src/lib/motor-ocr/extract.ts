import { motorDocumentOcrSchema, type MotorDocumentOcrResult } from './schema';
import { generateMotorOcrJsonContent } from './providers/openrouter-gemini';

export const MOTOR_OCR_PROMPT = `Extract normalized Philippine motor car insurance policy or OR-CR data from this document image.

Return only valid JSON with this exact shape:
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
    "variant": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
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
    "previousPremium": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "premiumSubtotal": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "premiumTaxes": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "premiumTotal": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "hasActsOfNature": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "hasAutoPersonalAccident": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" },
    "hasRoadsideAssistance": { "value": "", "confidence": 0.0 to 1.0, "sourceLabel": "", "sourceText": "" }
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
- trim / variant / submodel -> variant
- classification / usage -> vehicleUse
- authorized capacity -> seatingCapacity
- serial no. / chassis no. -> chassisNumber
- motor no. / engine no. -> engineNumber
- fair market value, FMV, sum insured -> estimatedMarketValue
- AON, AOG, acts of god, acts of nature -> actsOfNature (value: "Included" or "Not Included")
- TPPD, third party property damage -> thirdPartyPropertyDamageLimit
- UPPA, auto personal accident -> autoPersonalAccident (value: "Included" or "Not Included")
- deductible, participation -> deductibleParticipation
- previous policy no., policy no. -> previousPolicyNumber
- insured by, insurer, company -> previousInsurer
- total premium, gross premium, premium amount -> previousPremium
- premium before taxes, net premium, basic premium -> premiumSubtotal
- taxes, documentary stamp, VAT, LGT -> premiumTaxes
- total amount due, grand total, total -> premiumTotal
- acts of nature included -> hasActsOfNature (value: "true" if included, "false" if not)
- personal accident included -> hasAutoPersonalAccident (value: "true" if included, "false" if not)
- roadside assistance included -> hasRoadsideAssistance (value: "true" if included, "false" if not)

Only include a field if the value is actually visible or strongly implied by labels on the document. Use YYYY-MM-DD for dates when possible. Use numeric strings without currency symbols for money fields when possible. Put uncertain visible text in unmappedText or warnings instead of inventing values.`;

function extractJsonObject(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function safeParseJson(text: string) {
  const candidate = extractJsonObject(text);
  try {
    return JSON.parse(candidate);
  } catch {
    // Attempt to repair truncated JSON by closing open braces/brackets
    let repaired = candidate;
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    // Remove trailing incomplete key-value pairs
    repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, '');
    repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*\{[^}]*$/, '');
    repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*\[[^\]]*$/, '');

    // Close missing brackets/braces
    for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']';
    for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}';

    return JSON.parse(repaired);
  }
}

export async function extractMotorDocumentFromImage(input: {
  imageBase64: string;
  mimeType: string;
  filename?: string;
}): Promise<MotorDocumentOcrResult> {
  const raw = await generateMotorOcrJsonContent({
    ...input,
    prompt: MOTOR_OCR_PROMPT,
  });

  const parsed = safeParseJson(raw);
  const validated = motorDocumentOcrSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Motor OCR response did not match schema: ${validated.error.message}`);
  }

  return validated.data;
}
