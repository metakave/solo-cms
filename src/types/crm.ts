export type ServiceType = 'ODOO_CONSULTING' | 'TRAINING' | 'ADVISORY';

export type Stage =
  | 'NEW_INQUIRY'
  | 'DISCOVERY_CALL'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON_ACTIVE'
  | 'COMPLETED'
  | 'LOST';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Milestone {
  id: string;
  leadId: string;
  title: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'INVOICED' | 'PAID';
  dueDate?: string | null;
  paidDate?: string | null;
  invoiceNumber?: string | null;
}

export interface Meeting {
  id: string;
  leadId?: string | null;
  title: string;
  startTime: string;
  endTime: string;
  locationType: string;
  meetUrl?: string | null;
  status: string;
  rawNotes?: string | null;
  aiSummary?: string | null;
  actionItems?: string | null;
  lead?: {
    id: string;
    name: string;
    company?: string | null;
    phone?: string | null;
    serviceType: string;
  } | null;
}

export interface ActivityLog {
  id: string;
  leadId: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  leadId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  poc?: string | null;
  title?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  serviceType: ServiceType;
  stage: Stage;
  dealValue: number;
  currency: string;
  probability: number;
  priority: Priority;
  aiScore?: number | null;
  aiPriorityReason?: string | null;
  aiDossier?: string | null;
  notes?: string | null;
  tags?: string | null;
  lastContactDate?: string | null;
  nextFollowUpDate?: string | null;
  nextFollowUpGoal?: string | null;
  createdAt: string;
  updatedAt: string;
  milestones?: Milestone[];
  meetings?: Meeting[];
  activities?: ActivityLog[];
  attachments?: Attachment[];
}

export interface RevenueMetrics {
  totalPipelineValue: number;
  expectedWeightedRevenue: number;
  totalCollected: number;
  totalInvoicedPending: number;
  activeDealsCount: number;
  serviceBreakdown: {
    ODOO_CONSULTING: { count: number; totalValue: number; collected: number };
    TRAINING: { count: number; totalValue: number; collected: number };
    ADVISORY: { count: number; totalValue: number; collected: number };
  };
  stageBreakdown: Record<string, number>;
}
