export type Role = 'admin' | 'user';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export type MonitorStatus = 'active' | 'paused' | 'error';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface PricePoint {
  date: string;
  price: number;
  marketAvg?: number;
  baselinePrice?: number;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  domain: string;
  category: string;
  currentPrice: number;
  previousPrice: number;
  baselinePrice?: number;
  marketAvgPrice?: number;
  lowestPrice30d?: number;
  highestPrice30d?: number;
  currency: string;
  changePercent: number;
  frequency: string;
  lastChecked: string;
  status: MonitorStatus;
  stockStatus: StockStatus;
  region?: string;
  state?: string;
  city?: string;
  pincode?: string;
  cogs?: number;
  minMarginPercent?: number;
  priceHistory: PricePoint[];
}

export interface Alert {
  id: string;
  monitorId: string;
  monitorName: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  state?: string;
  city?: string;
  policyId?: string;
  isGovtAlert?: boolean;
  authority?: string;
}

export type PolicyCategory = 
  | 'Govt Regulatory Compliance' 
  | 'Tax & GST' 
  | 'Consumer Protection' 
  | 'Pricing Defense' 
  | 'Supply Chain & Labour';

export interface Policy {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  action: string;
  enabled: boolean;
  scopeType?: 'national' | 'state' | 'city';
  scopeState?: string;
  scopeCity?: string;
  category?: PolicyCategory | string;
  authority?: string;
  penaltyNotice?: string;
  isGovtPolicy?: boolean;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'success' | 'warning' | 'error';
}

export interface DashboardStats {
  totalMonitors: number;
  activeMonitors: number;
  criticalAlerts: number;
  avgPriceChange: number;
  lastSyncTime: string;
}
