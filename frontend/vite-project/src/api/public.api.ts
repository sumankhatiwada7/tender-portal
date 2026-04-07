import api from "./axios";

export type PublicPlatformStats = {
  totalTenders: number;
  openTenders: number;
  totalTenderValue: number;
  registeredBusinesses: number;
  governmentOffices: number;
  totalBids: number;
};

type PublicPlatformStatsResponse = {
  success?: boolean;
  stats?: PublicPlatformStats;
};

const EMPTY_STATS: PublicPlatformStats = {
  totalTenders: 0,
  openTenders: 0,
  totalTenderValue: 0,
  registeredBusinesses: 0,
  governmentOffices: 0,
  totalBids: 0,
};

export async function getPublicPlatformStats() {
  const response = await api.get<PublicPlatformStatsResponse>("/tender/public/stats");
  return response.data.stats ?? EMPTY_STATS;
}
