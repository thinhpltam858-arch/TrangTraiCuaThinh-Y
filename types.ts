// Fix: Create the `types.ts` file to provide shared type definitions.
export type LogEntryType = 'creation' | 'update' | 'feeding' | 'medicine' | 'death' | 'note' | 'harvest';

export interface LogEntry {
    date: string;
    type: LogEntryType;
    details: string; // e.g., "Trọng lượng mới: 250g" or "Chi phí: 15,000 VND"
    meta?: Record<string, any>; // For extra structured data, e.g., { weight: 250, cost: 15000, user: 'email@example.com' }
}

export interface FeedHistoryEntry {
    date: string;
    feedType: string;
    weight: number;
    cost: number;
}

export interface Cage {
  id: string;
  startDate: string;
  initialWeight: number;
  currentWeight: number;
  deadCrabCount: number;
  costs: {
    seed: number;
    feed: number;
    medicine: number;
  };
  growthHistory: number[];
  aiAlert: boolean;
  progress: number;
  log: LogEntry[];
  feedHistory: FeedHistoryEntry[];
}

export interface HarvestedCage {
  id: string;
  harvestDate: string;
  finalWeight: number;
  profit: number;
  revenue: number;
  totalCost: number;
  costs: {
    seed: number;
    feed: number;
    medicine: number;
  };
}

export enum ReportType {
    Overview = 'overview',
    Performance = 'performance',
    HarvestReady = 'harvest-ready',
    Profit = 'profit',
    Inventory = 'inventory'
}

export interface AIHealthReport {
    healthStatus: 'KHỎE MẠNH' | 'CẦN CHÚ Ý' | 'NGUY CƠ CAO';
    statusColor: 'green' | 'yellow' | 'red';
    summary: string;
    keyObservations: {
        text: string;
        isPositive: boolean;
    }[];
    recommendation: string;
}

export type Theme = 'blue' | 'green' | 'orange';

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Notification {
  id: string;
  type: 'alert' | 'harvest';
  message: string;
  cageId: string;
  timestamp: string;
  read: boolean;
}

export interface User {
    uid: string;
    email: string | null;
}