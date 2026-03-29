import { create } from 'zustand';
import type { BusinessPermitOcrData } from '@/lib/ocr-schema';
import type { PolicyOcrData } from '@/lib/policy-ocr-schema';

export const TOTAL_STEPS = 5;

// ── Scan Type ───────────────────────────────────────────────

export type ScanType = 'permit' | 'policy' | 'manual' | null;

// ── Data interfaces ──────────────────────────────────────────

interface BusinessInfoData {
  fullName: string;
  businessName: string;
  tin: string;
  floorArea: string;
  natureOfBusiness: string;
  effectiveDate: string;
  streetAddress: string;
  phone: string;
  email: string;
  buildingFloors: string;
  buildingType: string;
  constructionType: string;
}

interface LocationData {
  regionCode: string;
  regionName: string;
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  barangayCode: string;
  barangayName: string;
}

interface ContactData {
  email: string;
  phone: string;
}

interface DocumentsData {
  businessPermit: File | null;
  dtiSec: File | null;
  validId: File | null;
}

interface PaymentData {
  method: string;
  proofOfPayment: string | null;
}

interface CoverNoteData {
  controlNumber: string;
  expiryTime: string;
}

// ── Store state ──────────────────────────────────────────────

interface WizardState {
  currentStep: number;
  businessInfo: BusinessInfoData;
  location: LocationData;
  contactCoverage: ContactData;
  documents: DocumentsData;
  payment: PaymentData;
  coverNote: CoverNoteData;
  scanData: BusinessPermitOcrData | null;
  policyData: PolicyOcrData | null;
  scanType: ScanType;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setCurrentStep: (step: number) => void;

  // Data setters
  setBusinessInfo: (data: Partial<BusinessInfoData>) => void;
  setLocation: (data: Partial<LocationData>) => void;
  setContactCoverage: (data: Partial<ContactData>) => void;
  setDocuments: (data: Partial<DocumentsData>) => void;
  setPayment: (data: Partial<PaymentData>) => void;
  setCoverNote: (data: Partial<CoverNoteData>) => void;
  setScanData: (data: BusinessPermitOcrData | null) => void;
  setPolicyData: (data: PolicyOcrData | null) => void;
  setScanType: (type: ScanType) => void;

  // Reset
  reset: () => void;
}

// ── Initial values ───────────────────────────────────────────

const initialBusinessInfo: BusinessInfoData = {
  fullName: '',
  businessName: '',
  tin: '',
  floorArea: '',
  natureOfBusiness: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  streetAddress: '',
  phone: '',
  email: '',
  buildingFloors: '',
  buildingType: '',
  constructionType: '',
};

const initialLocation: LocationData = {
  regionCode: '',
  regionName: '',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  barangayCode: '',
  barangayName: '',
};

const initialContactCoverage: ContactData = {
  email: '',
  phone: '',
};

const initialDocuments: DocumentsData = {
  businessPermit: null,
  dtiSec: null,
  validId: null,
};

const initialPayment: PaymentData = {
  method: '',
  proofOfPayment: null,
};

const initialCoverNote: CoverNoteData = {
  controlNumber: '',
  expiryTime: '',
};

// ── Store ────────────────────────────────────────────────────

export const useApplicationStore = create<WizardState>()((set) => ({
  currentStep: 1,
  businessInfo: initialBusinessInfo,
  location: initialLocation,
  contactCoverage: initialContactCoverage,
  documents: initialDocuments,
  payment: initialPayment,
  coverNote: initialCoverNote,
  scanData: null,
  policyData: null,
  scanType: null,

  // Navigation
  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  goToStep: (step) =>
    set({
      currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
    }),

  setCurrentStep: (step) =>
    set({
      currentStep: Math.max(1, Math.min(step, TOTAL_STEPS)),
    }),

  // Data setters (merge-style)
  setBusinessInfo: (data) =>
    set((state) => ({
      businessInfo: { ...state.businessInfo, ...data },
    })),

  setLocation: (data) =>
    set((state) => ({
      location: { ...state.location, ...data },
    })),

  setContactCoverage: (data) =>
    set((state) => ({
      contactCoverage: { ...state.contactCoverage, ...data },
    })),

  setDocuments: (data) =>
    set((state) => ({
      documents: { ...state.documents, ...data },
    })),

  setPayment: (data) =>
    set((state) => ({
      payment: { ...state.payment, ...data },
    })),

  setCoverNote: (data) =>
    set((state) => ({
      coverNote: { ...state.coverNote, ...data },
    })),

  setScanData: (data) =>
    set({
      scanData: data,
    }),

  setPolicyData: (data) =>
    set({
      policyData: data,
    }),

  setScanType: (type: ScanType) =>
    set({
      scanType: type,
    }),

  // Reset
  reset: () =>
    set({
      currentStep: 1,
      businessInfo: initialBusinessInfo,
      location: initialLocation,
      contactCoverage: initialContactCoverage,
      documents: initialDocuments,
      payment: initialPayment,
      coverNote: initialCoverNote,
      scanData: null,
      policyData: null,
      scanType: null,
    }),
}));

// ── Type exports ────────────────────────────────────────────

export type BusinessInfo = BusinessInfoData;
export type Location = LocationData;
export type Contact = ContactData;
export type { CoverNoteData };

// ── Helper functions ────────────────────────────────────────

export function generateControlNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `CGL-${date}-${suffix}`;
}

export function generateExpiryTime(hours: number = 6): string {
  const expiry = new Date(Date.now() + hours * 60 * 60 * 1000);
  return expiry.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });
}
