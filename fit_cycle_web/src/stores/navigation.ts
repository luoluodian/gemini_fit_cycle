import { defineStore } from 'pinia';

export const useNavigationStore = defineStore('navigation', {
  state: () => ({
    activeTab: 0,
  }),
  actions: {
    setActiveTab(index: number) {
      this.activeTab = index;
    },
  },
});
