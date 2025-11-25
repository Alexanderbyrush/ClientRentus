// services/contractService.ts
import api from "@/services/api";

export const contractService = {
  async getContracts() {
    const response = await api.get("/auth/contracts");
    return response.data;
  },

  async getContractStats() {
    const response = await api.get("/auth/contracts/stats");
    return response.data; // { active: number, pending: number, total: number }
  },
};
