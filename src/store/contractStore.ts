import { defineStore } from 'pinia';
import { contractService } from '@/services/contractService';

export const useContractStore = defineStore('contracts', {
  state: () => ({
    contracts: [],
    loaded: false,
  }),
  actions: {
    async loadContracts() {
      if (!this.loaded) {
        const res = await contractService.getContracts();
        this.contracts = res;
        this.loaded = true;
      }
    }
  }
});
