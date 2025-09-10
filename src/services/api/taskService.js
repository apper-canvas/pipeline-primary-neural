import { toast } from "react-toastify";
import React from "react";

class TaskService {
  constructor() {
    this.tableName = 'task_c';
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  // Sanitize task data to prevent circular structure errors
  sanitizeTaskData(taskData) {
    if (!taskData) return {};
    
    // Create a clean object with only primitive values
    const sanitized = {};
    
    // Extract string values safely
    if (taskData.subject !== undefined) sanitized.subject = String(taskData.subject || '');
    if (taskData.Name !== undefined) sanitized.Name = String(taskData.Name || '');
    if (taskData.description !== undefined) sanitized.description = String(taskData.description || '');
    if (taskData.status !== undefined) sanitized.status = String(taskData.status || '');
    if (taskData.priority !== undefined) sanitized.priority = String(taskData.priority || '');
    if (taskData.category !== undefined) sanitized.category = String(taskData.category || '');
    if (taskData.recurrencePattern !== undefined) sanitized.recurrencePattern = String(taskData.recurrencePattern || '');
    
    // Handle date fields - ensure they're clean strings or null
    if (taskData.dueDate !== undefined) {
      if (taskData.dueDate && typeof taskData.dueDate === 'string') {
        sanitized.dueDate = taskData.dueDate;
      } else if (taskData.dueDate instanceof Date) {
        sanitized.dueDate = taskData.dueDate.toISOString();
      } else {
        sanitized.dueDate = null;
      }
    }
    
    if (taskData.startDate !== undefined) {
      if (taskData.startDate && typeof taskData.startDate === 'string') {
        sanitized.startDate = taskData.startDate;
      } else if (taskData.startDate instanceof Date) {
        sanitized.startDate = taskData.startDate.toISOString();
      } else {
        sanitized.startDate = null;
      }
    }
    
    if (taskData.completedDate !== undefined) {
      if (taskData.completedDate && typeof taskData.completedDate === 'string') {
        sanitized.completedDate = taskData.completedDate;
      } else if (taskData.completedDate instanceof Date) {
        sanitized.completedDate = taskData.completedDate.toISOString();
      } else {
        sanitized.completedDate = null;
      }
    }
    
    if (taskData.reminderTime !== undefined) {
      if (taskData.reminderTime && typeof taskData.reminderTime === 'string') {
        sanitized.reminderTime = taskData.reminderTime;
      } else if (taskData.reminderTime instanceof Date) {
        sanitized.reminderTime = taskData.reminderTime.toISOString();
      } else {
        sanitized.reminderTime = null;
      }
    }
    
    // Handle lookup fields - extract only the ID value
    if (taskData.contactId !== undefined) {
      if (typeof taskData.contactId === 'string' || typeof taskData.contactId === 'number') {
        sanitized.contactId = taskData.contactId;
      } else if (taskData.contactId && typeof taskData.contactId === 'object') {
        // Extract ID from object if it exists
        sanitized.contactId = taskData.contactId.Id || taskData.contactId.id || null;
      } else {
        sanitized.contactId = null;
      }
    }
    
    // Handle boolean fields
    if (taskData.isRecurring !== undefined) {
      sanitized.isRecurring = Boolean(taskData.isRecurring);
    }
    
    if (taskData.reminderSet !== undefined) {
      sanitized.reminderSet = Boolean(taskData.reminderSet);
    }
    
    return sanitized;
  }

  // Get all tasks with optional filtering and sorting
  async getAll(filters = {}) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "startDate_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "isRecurring_c"}},
          {"field": {"Name": "recurrencePattern_c"}},
          {"field": {"Name": "completedDate_c"}},
          {"field": {"Name": "reminderSet_c"}},
          {"field": {"Name": "reminderTime_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "Owner"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 50, "offset": 0}
      };

      // Add filters if provided
      if (filters.status) {
        params.where = params.where || [];
        params.where.push({
          "FieldName": "status_c",
          "Operator": "ExactMatch", 
          "Values": [filters.status],
          "Include": true
        });
      }

      if (filters.priority) {
        params.where = params.where || [];
        params.where.push({
          "FieldName": "priority_c",
          "Operator": "ExactMatch",
          "Values": [filters.priority], 
          "Include": true
        });
      }

      if (filters.contactId) {
        params.where = params.where || [];
        params.where.push({
          "FieldName": "contactId_c",
          "Operator": "ExactMatch",
          "Values": [parseInt(filters.contactId)],
          "Include": true
        });
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      toast.error("Failed to load tasks");
      return [];
    }
  }

  // Get task by ID
  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "subject_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "dueDate_c"}},
          {"field": {"Name": "startDate_c"}},
          {"field": {"Name": "contactId_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "isRecurring_c"}},
          {"field": {"Name": "recurrencePattern_c"}},
          {"field": {"Name": "completedDate_c"}},
          {"field": {"Name": "reminderSet_c"}},
          {"field": {"Name": "reminderTime_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}},
          {"field": {"Name": "Owner"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      toast.error("Failed to load task details");
      return null;
    }
  }

  // Create new task
async create(taskData) {
    try {
      // Sanitize task data to prevent circular structure errors
      const sanitizedData = this.sanitizeTaskData(taskData);
      
      // Only include Updateable fields
// Only include Updateable fields
      const params = {
        records: [{
          Name: sanitizedData.subject || sanitizedData.Name || 'New Task',
          subject_c: sanitizedData.subject || 'Untitled Task',
          status_c: sanitizedData.status || 'New',
          priority_c: sanitizedData.priority || 'Medium',
          description_c: sanitizedData.description || '',
          dueDate_c: sanitizedData.dueDate || null,
          startDate_c: sanitizedData.startDate || null,
          contactId_c: sanitizedData.contactId ? parseInt(sanitizedData.contactId) : null,
          category_c: sanitizedData.category || '',
          isRecurring_c: Boolean(sanitizedData.isRecurring) || false,
          recurrencePattern_c: sanitizedData.recurrencePattern || '',
          completedDate_c: sanitizedData.completedDate || null,
          reminderSet_c: Boolean(sanitizedData.reminderSet) || false,
          reminderTime_c: sanitizedData.reminderTime || null
        }]
      
      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:${JSON.stringify(failed)}`);
          failed.forEach(record => {
record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Task created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      toast.error("Failed to create task");
      return null;
    }
  }

  // Update task
async update(id, taskData) {
    try {
      // Sanitize task data to prevent circular structure errors
      const sanitizedData = this.sanitizeTaskData(taskData);
// Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: sanitizedData.subject || sanitizedData.Name || 'Updated Task',
          subject_c: sanitizedData.subject || '',
          status_c: sanitizedData.status || 'New',
          priority_c: sanitizedData.priority || 'Medium',
          description_c: sanitizedData.description || '',
          dueDate_c: sanitizedData.dueDate || null,
          startDate_c: sanitizedData.startDate || null,
          contactId_c: sanitizedData.contactId ? parseInt(sanitizedData.contactId) : null,
          category_c: sanitizedData.category || '',
          isRecurring_c: Boolean(sanitizedData.isRecurring) || false,
          recurrencePattern_c: sanitizedData.recurrencePattern || '',
          completedDate_c: sanitizedData.completedDate || null,
          reminderSet_c: Boolean(sanitizedData.reminderSet) || false,
          reminderTime_c: sanitizedData.reminderTime || null
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:${JSON.stringify(failed)}`);
          failed.forEach(record => {
record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error.message}`));
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Task updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      toast.error("Failed to update task");
      return null;
    }
  }

  // Delete task
  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          toast.success('Task deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      toast.error("Failed to delete task");
      return false;
    }
  }
}

export const taskService = new TaskService();
export default taskService;