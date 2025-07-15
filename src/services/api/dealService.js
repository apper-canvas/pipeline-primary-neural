import mockDeals from "@/services/mockData/deals.json";

class DealService {
  constructor() {
    this.deals = [...mockDeals];
  }

async getAll(userId = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // If no userId provided or user has permission to view all deals, return all
    if (!userId) {
      return [...this.deals];
    }
    
    // Filter deals based on user permissions via userService
    const { userService } = await import('@/services/api/userService');
    const currentUser = await userService.getCurrentUser();
    
    if (!currentUser) {
      return [];
    }
    
    // Managers and admins can see all deals
    if (currentUser.permissions.includes('view_all_deals')) {
      return [...this.deals];
    }
    
    // Regular sales reps only see their own deals
    // For demo purposes, we'll show deals where contactId matches user preferences
    // In a real app, deals would have an assignedTo field
    const userDealsIds = this.getUserDealIds(currentUser.Id);
    const filteredDeals = this.deals.filter(deal => 
      userDealsIds.includes(deal.Id) || 
      this.isUserAssignedToDeal(deal, currentUser)
    );
    
    return [...filteredDeals];
  }

  getUserDealIds(userId) {
    // Demo logic: distribute deals based on user ID
    const allDealIds = this.deals.map(d => d.Id);
    if (userId === 1) return allDealIds; // Manager sees all
    if (userId === 2) return [1, 2, 4, 7, 9]; // Sales rep sees subset
    if (userId === 3) return allDealIds; // Admin sees all
    return allDealIds.slice(0, 3); // Default fallback
  }

  isUserAssignedToDeal(deal, user) {
    // Demo logic: some deals are assigned based on contact relationship
    if (user.role === 'sales_rep') {
      return parseInt(deal.contactId) % 3 === (user.Id % 3);
    }
    return true;
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const deal = this.deals.find(d => d.Id === parseInt(id));
    if (!deal) {
      throw new Error("Deal not found");
    }
    return { ...deal };
  }

  async create(dealData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newDeal = {
      ...dealData,
      Id: Math.max(...this.deals.map(d => d.Id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.deals.push(newDeal);
    return { ...newDeal };
  }

  async update(id, dealData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    const updatedDeal = {
      ...this.deals[index],
      ...dealData,
      Id: parseInt(id),
      updatedAt: new Date().toISOString()
    };
    
    this.deals[index] = updatedDeal;
    return { ...updatedDeal };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.deals.findIndex(d => d.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Deal not found");
    }
    
    this.deals.splice(index, 1);
    return true;
  }
}

export const dealService = new DealService();