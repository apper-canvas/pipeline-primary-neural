import { toast } from 'react-toastify';

class ActivityService {
  constructor() {
    this.tableName = 'app_Activity';
    this.emailFollowUps = [];
  }

  async getAll(userId = null) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "dealId" } },
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          {
            fieldName: "timestamp",
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
        console.error("Error fetching activities:", error?.response?.data?.message);
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
          { field: { Name: "Name" } },
          { field: { Name: "dealId" } },
          { field: { Name: "type" } },
          { field: { Name: "description" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } }
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
        console.error(`Error fetching activity with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async create(activityData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Name: activityData.name || activityData.description || "Activity",
            dealId: activityData.dealId ? parseInt(activityData.dealId) : null,
            type: activityData.type || "note",
            description: activityData.description || "",
            timestamp: activityData.timestamp || new Date().toISOString(),
            Tags: activityData.tags || ""
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
          toast.success('Activity created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating activity:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return null;
    }
  }

  async update(id, activityData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: activityData.name || activityData.description || "Activity",
            dealId: activityData.dealId ? parseInt(activityData.dealId) : null,
            type: activityData.type || "note",
            description: activityData.description || "",
            timestamp: activityData.timestamp || new Date().toISOString(),
            Tags: activityData.tags || ""
          }
        ]
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
          toast.success('Activity updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating activity:", error?.response?.data?.message);
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
        console.error("Error deleting activity:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return false;
    }
  }

  // Email Follow-up Management (preserved as mock functionality)
  async createEmailFollowUp(followUpData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newFollowUp = {
      ...followUpData,
      Id: Math.max(...this.emailFollowUps.map(f => f.Id), 0) + 1,
      createdDate: new Date().toISOString(),
      status: followUpData.status || "scheduled"
    };
    
    this.emailFollowUps.push(newFollowUp);
    
    // Create activity record for the follow-up
    const activityData = {
      type: "email_followup",
      dealId: followUpData.dealId,
      description: `Email follow-up scheduled: ${followUpData.subject}`,
      emailFollowUpId: newFollowUp.Id,
      followUpPriority: followUpData.priority,
      followUpTemplate: followUpData.template
    };
    
    await this.create(activityData);
    return { ...newFollowUp };
  }

  async getFollowUpsByDeal(dealId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const followUps = this.emailFollowUps.filter(followUp => 
      followUp.dealId === parseInt(dealId)
    );
    
    // Update overdue status
    const now = new Date();
    followUps.forEach(followUp => {
      if (followUp.status === "scheduled" && new Date(followUp.scheduledDate) < now) {
        followUp.status = "overdue";
      }
    });
    
    return followUps.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  }
  
  async updateFollowUpStatus(followUpId, status) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const followUp = this.emailFollowUps.find(f => f.Id === parseInt(followUpId));
    if (!followUp) {
      throw new Error("Follow-up not found");
    }
    
    followUp.status = status;
    
    if (status === "sent") {
      // Create activity record when follow-up is sent
      const activityData = {
        type: "email",
        dealId: followUp.dealId,
        description: `Email follow-up sent: ${followUp.subject}`,
        emailFollowUpId: followUp.Id
      };
      
      await this.create(activityData);
    }
    
    return { ...followUp };
  }

  async getAllFollowUps() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update overdue status
    const now = new Date();
    this.emailFollowUps.forEach(followUp => {
      if (followUp.status === "scheduled" && new Date(followUp.scheduledDate) < now) {
        followUp.status = "overdue";
      }
    });
    
    return [...this.emailFollowUps];
  }

  async getOverdueFollowUps() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date();
    const overdueFollowUps = this.emailFollowUps.filter(followUp => 
      followUp.status === "scheduled" && new Date(followUp.scheduledDate) < now
    );
    
    // Update their status to overdue
    overdueFollowUps.forEach(followUp => {
      followUp.status = "overdue";
    });
    
    return overdueFollowUps;
  }

  async deleteFollowUp(followUpId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.emailFollowUps.findIndex(f => f.Id === parseInt(followUpId));
    if (index === -1) {
      throw new Error("Follow-up not found");
    }
    
    this.emailFollowUps.splice(index, 1);
    return true;
  }
}

// Create and export service instance
const activityService = new ActivityService();
export { activityService };
export default activityService;