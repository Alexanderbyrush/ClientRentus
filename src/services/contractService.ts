// services/contractService.ts
import api from "@/services/api";

export const contractService = {
  async getContracts() {
    const response = await api.get("/contracts");
    return response.data;
  },

  async getContractStats() {
    const response = await api.get("/contracts/stats");
    return response.data; // { active: number, pending: number, total: number }
  },
};
