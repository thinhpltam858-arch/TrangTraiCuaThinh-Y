
export interface LogEntry {
  date: string;
  message: string;
}

export interface Cage {
  id: string;
  startDate: string;
  initialWeight: number;
  currentWeight: number;
  progress: number;
  costs: {
    seed: number;
    feed: number;
    medicine: number;
  };
  growthHistory: number[];
  log: LogEntry[];
  aiAlert: boolean;
  deadCrabCount: number;
}

export interface HarvestedCage extends Cage {
  finalWeight: number;
  pricePerKg: number;
  revenue: number;
  profit: number;
  harvestDate: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export enum ReportType {
    Overview = 'overview',
    Performance = 'performance',
    HarvestReady = 'harvest-ready',
    Profit = 'profit',
    Inventory = 'inventory'
}

export type Theme = 'blue' | 'green' | 'orange';

export interface AIHealthReport {
  healthStatus: 'KHỎE MẠNH' | 'CẦN CHÚ Ý' | 'NGUY CƠ CAO';
  statusColor: 'green' | 'yellow' | 'red';
  summary: string;
  keyObservations: { text: string; isPositive: boolean }[];
  recommendation: string;
}
