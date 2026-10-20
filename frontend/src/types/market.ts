export interface MandiPrice {
  id: string;
  commodity: string;
  market: string;
  district: string;
  variety: string;
  grade: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalQuantity?: number;
  arrivalUnit?: string;
  priceUnit?: string;
  date: string;
  source: string;
}

export interface MandiSummary {
  totalMandis: number;
  totalCommodities: number;
  totalDistricts: number;
  totalRecords: number;
  avgModalPrice: number;
  latestReportDate: string;
  source: string;
}

export interface MandiStatus {
  source: string;
  reportDate: string | null;
  lastRunStartedAt?: string;
  lastRunFinishedAt?: string;
  lastRunStatus: string;
  recordsReceived?: number;
  validRecords?: number;
  rejectedRecords?: number;
  completenessEstablished: boolean;
  coverageState?: string;
  coverageMessage?: string;
  lastSuccessfulIngestionTime: string | null;
}

export interface MarketPricesResponse {
  prices: MandiPrice[];
  district: string;
  commodity: string;
  totalCount: number;
  page: number;
  pageSize: number;
  count: number;
  fetchedAt: string;
  source: string;
}
