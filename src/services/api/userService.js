const mockUsers = [
  {
    Id: 1,
    email: "sarah.smith@company.com",
    name: "Sarah Smith",
    role: "sales_manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    department: "Sales",
    permissions: ["view_all_deals", "edit_all_deals", "view_reports", "manage_team"],
    preferences: {
      defaultDashboardLayout: "compact",
      showTeamMetrics: true,
      preferredCurrency: "USD"
    },
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    Id: 2,
    email: "john.doe@company.com", 
    name: "John Doe",
    role: "sales_rep",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    department: "Sales",
    permissions: ["view_own_deals", "edit_own_deals"],
    preferences: {
      defaultDashboardLayout: "detailed",
      showTeamMetrics: false,
      preferredCurrency: "USD"
    },
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    Id: 3,
    email: "admin@company.com",
    name: "Admin User", 
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    department: "Management",
    permissions: ["view_all_deals", "edit_all_deals", "view_reports", "manage_team", "admin_access"],
    preferences: {
      defaultDashboardLayout: "executive",
      showTeamMetrics: true,
      preferredCurrency: "USD"
    },
    createdAt: "2024-01-01T00:00:00.000Z"
  }
];

class UserService {
  constructor() {
    this.users = [...mockUsers];
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  async login(email, password) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    this.currentUser = { ...user };
    this.isAuthenticated = true;
    
    // Simulate storing in localStorage
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    localStorage.setItem('isAuthenticated', 'true');
    
    return { ...this.currentUser };
  }

  async logout() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    this.currentUser = null;
    this.isAuthenticated = false;
    
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    
    return true;
  }

  async getCurrentUser() {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      const storedAuth = localStorage.getItem('isAuthenticated');
      
      if (storedUser && storedAuth === 'true') {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    }
    
    return this.currentUser ? { ...this.currentUser } : null;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.users];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const user = this.users.find(u => u.Id === parseInt(id));
    if (!user) {
      throw new Error("User not found");
    }
    return { ...user };
  }

  async updateProfile(id, userData) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const index = this.users.findIndex(u => u.Id === parseInt(id));
    if (index === -1) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...this.users[index],
      ...userData,
      Id: parseInt(id)
    };
    
    this.users[index] = updatedUser;
    
    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.Id === parseInt(id)) {
      this.currentUser = { ...updatedUser };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    
    return { ...updatedUser };
  }

  async updatePreferences(userId, preferences) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.users.findIndex(u => u.Id === parseInt(userId));
    if (index === -1) {
      throw new Error("User not found");
    }
    
    this.users[index].preferences = {
      ...this.users[index].preferences,
      ...preferences
    };
    
    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.Id === parseInt(userId)) {
      this.currentUser = { ...this.users[index] };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    
    return { ...this.users[index].preferences };
  }

  hasPermission(permission) {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  isManager() {
    if (!this.currentUser) return false;
    return ['sales_manager', 'admin'].includes(this.currentUser.role);
  }

  canViewAllDeals() {
    return this.hasPermission('view_all_deals');
  }

  canEditAllDeals() {
    return this.hasPermission('edit_all_deals');
  }

  // Auto-login for demo purposes (remove in production)
  async autoLogin() {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!this.isAuthenticated) {
      // Default to sales_manager for demo
      return this.login("sarah.smith@company.com", "password");
    }
    
    return this.getCurrentUser();
  }
}

export const userService = new UserService();