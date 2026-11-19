export type DemoRole = "admin" | "reviewer" | "finance" | "supplier" | "supplier_finance";
export type SubmissionStatus = "not_started" | "draft" | "pending" | "returned" | "approved";
export type QualificationStatus = "valid" | "expiring" | "expired" | "pending";

export interface Contact {
  id: string;
  name: string;
  department: string;
  position: string;
  mobile: string;
  email: string;
  primary: boolean;
}

export interface Qualification {
  id: string;
  type: string;
  number: string;
  validUntil: string;
  uploadedAt: string;
  fileName: string;
  status: QualificationStatus;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  category: "食品经销" | "食品生产" | "百货" | "综合";
  creditCode: string;
  legalPerson: string;
  phone: string;
  email: string;
  postalCode: string;
  registeredAddress: string;
  businessAddress: string;
  bankName: string;
  bankAccount: string;
  status: "active" | "inactive";
  submissionStatus: SubmissionStatus;
  completion: number;
  lastUpdated: string;
  reviewNote: string;
  contacts: Contact[];
  qualifications: Qualification[];
}

export interface SubAccount {
  id: string;
  supplierId: string;
  name: string;
  mobile: string;
  permissions: string[];
  status: "active" | "inactive";
  lastLogin: string;
}

export interface Activity {
  id: string;
  supplierId: string;
  title: string;
  detail: string;
  date: string;
  kind: "info" | "success" | "warning";
}

export interface DemoData {
  suppliers: Supplier[];
  subAccounts: SubAccount[];
  activities: Activity[];
}
