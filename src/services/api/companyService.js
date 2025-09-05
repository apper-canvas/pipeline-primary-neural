import { toast } from 'react-toastify';

class CompanyService {
  constructor() {
this.tableName = 'company_c';
  }

  // Utility function to simulate API delay
  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name_c" } },
          { field: { Name: "Website_c" } },
          { field: { Name: "Industry_c" } },
          { field: { Name: "NumberOfEmployees_c" } },
          { field: { Name: "AnnualRevenue_c" } },
          { field: { Name: "Address_c" } },
          { field: { Name: "Description_c" } },
          { field: { Name: "lead_lookup_c" } },
          { field: { Name: "deal_lookup_c" } }
        ],
        orderBy: [
          {
            fieldName: "Id",
            sorttype: "DESC"
          }
        ]
      };

      const response = await apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching companies:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  }

async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name_c" } },
          { field: { Name: "Website_c" } },
          { field: { Name: "Industry_c" } },
          { field: { Name: "NumberOfEmployees_c" } },
          { field: { Name: "AnnualRevenue_c" } },
          { field: { Name: "Address_c" } },
          { field: { Name: "Description_c" } },
          { field: { Name: "lead_lookup_c" } },
          { field: { Name: "deal_lookup_c" } }
        ]
      };

      const response = await apperClient.getRecordById(this.tableName, id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching company ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

async create(companyData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Name_c: companyData.name,
            Industry_c: companyData.industry,
            Website_c: companyData.website || "",
            Address_c: companyData.address || "",
            Description_c: companyData.description || "",
            NumberOfEmployees_c: companyData.employees || 1,
            AnnualRevenue_c: companyData.revenue || 0,
            lead_lookup_c: companyData.lead_lookup_c ? parseInt(companyData.lead_lookup_c) : null
          }
        ]
      };
      
      const response = await apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Company created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating company:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

async update(id, companyData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const updateData = {
        Id: parseInt(id)
      };
      
      // Only include fields that are being updated
      if (companyData.name !== undefined) updateData.Name_c = companyData.name;
      if (companyData.industry !== undefined) updateData.Industry_c = companyData.industry;
      if (companyData.website !== undefined) updateData.Website_c = companyData.website;
      if (companyData.address !== undefined) updateData.Address_c = companyData.address;
      if (companyData.description !== undefined) updateData.Description_c = companyData.description;
      if (companyData.employees !== undefined) updateData.NumberOfEmployees_c = companyData.employees;
      if (companyData.revenue !== undefined) updateData.AnnualRevenue_c = companyData.revenue;
      if (companyData.lead_lookup_c !== undefined) updateData.lead_lookup_c = companyData.lead_lookup_c ? parseInt(companyData.lead_lookup_c) : null;
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Company updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating company:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting company:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }
}

// Create and export a singleton instance
export const companyService = new CompanyService();
export default companyService;