import { toast } from 'react-toastify';
import companiesData from '../mockData/companies.json';

class CompanyService {
  constructor() {
    this.tableName = 'company';
    this.companies = [...companiesData];
  }

  // Utility function to simulate API delay
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    try {
      await this.delay();
      
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name" } },
          { field: { Name: "industry" } },
          { field: { Name: "size" } },
          { field: { Name: "website" } },
          { field: { Name: "phone" } },
          { field: { Name: "email" } },
          { field: { Name: "address" } },
          { field: { Name: "description" } },
          { field: { Name: "foundedYear" } },
          { field: { Name: "revenue" } },
          { field: { Name: "employees" } },
          { field: { Name: "createdAt" } }
        ]
      };

      return [...this.companies];
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Failed to fetch companies");
    }
  }

  async getById(id) {
    try {
      await this.delay();
      
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name" } },
          { field: { Name: "industry" } },
          { field: { Name: "size" } },
          { field: { Name: "website" } },
          { field: { Name: "phone" } },
          { field: { Name: "email" } },
          { field: { Name: "address" } },
          { field: { Name: "description" } },
          { field: { Name: "foundedYear" } },
          { field: { Name: "revenue" } },
          { field: { Name: "employees" } },
          { field: { Name: "createdAt" } }
        ]
      };

      const company = this.companies.find(c => c.Id === parseInt(id));
      
      if (!company) {
        throw new Error(`Company with ID ${id} not found`);
      }
      
      return { ...company };
    } catch (error) {
      console.error(`Error fetching company ${id}:`, error);
      throw error;
    }
  }

  async create(companyData) {
    try {
      await this.delay();
      
      // Validate required fields
      if (!companyData.name || !companyData.industry || !companyData.email) {
        throw new Error("Name, industry, and email are required");
      }

      const params = {
        records: [
          {
            name: companyData.name,
            industry: companyData.industry,
            size: companyData.size || "Small",
            website: companyData.website || "",
            phone: companyData.phone || "",
            email: companyData.email,
            address: companyData.address || "",
            description: companyData.description || "",
            foundedYear: companyData.foundedYear || new Date().getFullYear(),
            revenue: companyData.revenue || 0,
            employees: companyData.employees || 1,
            createdAt: new Date().toISOString()
          }
        ]
      };

      const newCompany = {
        Id: Math.max(...this.companies.map(c => c.Id), 0) + 1,
        name: companyData.name,
        industry: companyData.industry,
        size: companyData.size || "Small",
        website: companyData.website || "",
        phone: companyData.phone || "",
        email: companyData.email,
        address: companyData.address || "",
        description: companyData.description || "",
        foundedYear: companyData.foundedYear || new Date().getFullYear(),
        revenue: companyData.revenue || 0,
        employees: companyData.employees || 1,
        createdAt: new Date().toISOString()
      };

      this.companies.push(newCompany);
      
      return { ...newCompany };
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  }

  async update(id, companyData) {
    try {
      await this.delay();
      
      const companyIndex = this.companies.findIndex(c => c.Id === parseInt(id));
      
      if (companyIndex === -1) {
        throw new Error(`Company with ID ${id} not found`);
      }

      // Validate required fields
      if (!companyData.name || !companyData.industry || !companyData.email) {
        throw new Error("Name, industry, and email are required");
      }

      const params = {
        records: [
          {
            Id: parseInt(id),
            name: companyData.name,
            industry: companyData.industry,
            size: companyData.size || "Small",
            website: companyData.website || "",
            phone: companyData.phone || "",
            email: companyData.email,
            address: companyData.address || "",
            description: companyData.description || "",
            foundedYear: companyData.foundedYear || new Date().getFullYear(),
            revenue: companyData.revenue || 0,
            employees: companyData.employees || 1
          }
        ]
      };

      const updatedCompany = {
        ...this.companies[companyIndex],
        name: companyData.name,
        industry: companyData.industry,
        size: companyData.size || this.companies[companyIndex].size,
        website: companyData.website || this.companies[companyIndex].website,
        phone: companyData.phone || this.companies[companyIndex].phone,
        email: companyData.email,
        address: companyData.address || this.companies[companyIndex].address,
        description: companyData.description || this.companies[companyIndex].description,
        foundedYear: companyData.foundedYear || this.companies[companyIndex].foundedYear,
        revenue: companyData.revenue || this.companies[companyIndex].revenue,
        employees: companyData.employees || this.companies[companyIndex].employees
      };

      this.companies[companyIndex] = updatedCompany;
      
      return { ...updatedCompany };
    } catch (error) {
      console.error(`Error updating company ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.delay();
      
      const companyIndex = this.companies.findIndex(c => c.Id === parseInt(id));
      
      if (companyIndex === -1) {
        throw new Error(`Company with ID ${id} not found`);
      }

      const params = { 
        RecordIds: [parseInt(id)]
      };

      this.companies.splice(companyIndex, 1);
      
      return true;
    } catch (error) {
      console.error(`Error deleting company ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const companyService = new CompanyService();
export default companyService;