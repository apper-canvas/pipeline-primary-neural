import { toast } from 'react-toastify';

class TaskService {
  constructor() {
    // Initialize ApperClient
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task_c';
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
      // Only include Updateable fields
      const params = {
        records: [{
          Name: taskData.subject || taskData.Name || 'New Task',
          subject_c: taskData.subject || '',
          description_c: taskData.description || '',
          status_c: taskData.status || 'New',
          priority_c: taskData.priority || 'Medium',
          dueDate_c: taskData.dueDate || null,
          startDate_c: taskData.startDate || null,
          contactId_c: taskData.contactId ? parseInt(taskData.contactId) : null,
          category_c: taskData.category || '',
          isRecurring_c: taskData.isRecurring || false,
          recurrencePattern_c: taskData.recurrencePattern || '',
          completedDate_c: taskData.completedDate || null,
          reminderSet_c: taskData.reminderSet || false,
          reminderTime_c: taskData.reminderTime || null
        }]
      };

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
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
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
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskData.subject || taskData.Name || 'Updated Task',
          subject_c: taskData.subject || '',
          description_c: taskData.description || '',
          status_c: taskData.status || 'New',
          priority_c: taskData.priority || 'Medium',
          dueDate_c: taskData.dueDate || null,
          startDate_c: taskData.startDate || null,
          contactId_c: taskData.contactId ? parseInt(taskData.contactId) : null,
          category_c: taskData.category || '',
          isRecurring_c: taskData.isRecurring || false,
          recurrencePattern_c: taskData.recurrencePattern || '',
          completedDate_c: taskData.completedDate || null,
          reminderSet_c: taskData.reminderSet || false,
          reminderTime_c: taskData.reminderTime || null
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
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
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