import { create } from 'zustand';

export const TOTAL_STEPS = 7;

// ── Data interfaces ──────────────────────────────────────────

interface BusinessInfoData {
  fullName: string;
  businessName: string;
  tin: string;
  floorArea: string;
  natureOfBusiness: string;
  streetAddress: string;
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

interface ContactCoverageData {
  email: string;
  phone: string;
  limitOfLiability: string;
  premium: string;
}

interface DocumentsData {
  businessPermit: string | null;
  dtiSec: string | null;
  validId: string | null;
}

interface PaymentData {
  method: string;
  proofOfPayment: string | null;
}

// ── Store state ──────────────────────────────────────────────

interface WizardState {
  currentStep: number;
  businessInfo: BusinessInfoData;
  location: LocationData;
  contactCoverage: ContactCoverageData;
  documents: DocumentsData;
  payment: PaymentData;

  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setCurrentStep: (step: number) => void;

  // Data setters
  setBusinessInfo: (data: Partial<BusinessInfoData>) => void;
  setLocation: (data: Partial<LocationData>) => void;
  setContactCoverage: (data: Partial<ContactCoverageData>) => void;
  setDocuments: (data: Partial<DocumentsData>) => void;
  setPayment: (data: Partial<PaymentData>) => void;

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
  streetAddress: '',
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

const initialContactCoverage: ContactCoverageData = {
  email: '',
  phone: '',
  limitOfLiability: '',
  premium: '',
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

// ── Store ────────────────────────────────────────────────────

export const useApplicationStore = create<WizardState>()((set) => ({
  currentStep: 1,
  businessInfo: initialBusinessInfo,
  location: initialLocation,
  contactCoverage: initialContactCoverage,
  documents: initialDocuments,
  payment: initialPayment,

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

  // Reset
  reset: () =>
    set({
      currentStep: 1,
      businessInfo: initialBusinessInfo,
      location: initialLocation,
      contactCoverage: initialContactCoverage,
      documents: initialDocuments,
      payment: initialPayment,
    }),
}));

// ── Type exports ────────────────────────────────────────────

export type BusinessInfo = BusinessInfoData;
export type Location = LocationData;
export type Contact = ContactCoverageData;
