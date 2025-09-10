import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/atoms/Modal";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Label from "@/components/atoms/Label";

const TaskModal = ({ isOpen, onClose, task, onSave, contacts = [] }) => {
const [formData, setFormData] = useState({
    subject: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    dueDate: '',
    startDate: '',
    contactId: '',
    category: '',
    isRecurring: false,
    recurrencePattern: '',
    completedDate: '',
    reminderSet: false,
    reminderTime: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Status options
  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Canceled', label: 'Canceled' }
  ];

// Priority options
  const priorityOptions = [
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  // Recurrence pattern options
  const recurrenceOptions = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
{ value: 'Monthly', label: 'Monthly' },
    { value: 'Quarterly', label: 'Quarterly' },
    { value: 'Yearly', label: 'Yearly' },
    { value: 'Custom', label: 'Custom' }
  ];

  // State for contact options
  const [contactOptions, setContactOptions] = useState([
    { value: '', label: 'Select Contact' }
  ]);

  // Load contacts for Assigned To dropdown
  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      const options = contactsData.map(contact => ({
        value: contact.Id.toString(),
        label: contact.Name || contact.email || `Contact ${contact.Id}`
      }));
      setContactOptions([
        { value: '', label: 'Select Contact' },
        ...options
      ]);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setContactOptions([{ value: '', label: 'Select Contact' }]);
    }
  };

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      loadContacts();
      if (task) {
        // Edit mode - populate with existing data
        setFormData({
          subject: task.subject_c || '',
          description: task.description_c || '',
          status: task.status_c || 'New',
          priority: task.priority_c || 'Medium',
          dueDate: task.dueDate_c ? new Date(task.dueDate_c).toISOString().split('T')[0] : '',
          startDate: task.startDate_c ? new Date(task.startDate_c).toISOString().split('T')[0] : '',
          contactId: task.contactId_c?.Id?.toString() || task.contactId_c?.toString() || '',
          category: task.category_c || '',
          isRecurring: task.isRecurring_c || false,
          recurrencePattern: task.recurrencePattern_c || '',
          completedDate: task.completedDate_c ? new Date(task.completedDate_c).toISOString().split('T')[0] : '',
          reminderSet: task.reminderSet_c || false,
          reminderTime: task.reminderTime_c ? new Date(task.reminderTime_c).toISOString().slice(0, 16) : ''
        });
      } else {
        // Create mode - reset to defaults
        setFormData({
          subject: '',
          description: '',
          status: 'New',
          priority: 'Medium',
          dueDate: '',
          startDate: '',
          contactId: '',
          category: '',
          isRecurring: false,
          recurrencePattern: '',
          completedDate: '',
          reminderSet: false,
          reminderTime: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, task]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
// Handle dependent fields
    if (field === 'status' && value === 'Completed' && !formData.completedDate) {
      setFormData(prev => ({
        ...prev,
        completedDate: new Date().toISOString().split('T')[0]
      }));
    }

    if (field === 'status' && value !== 'Completed') {
      setFormData(prev => ({
        ...prev,
        completedDate: ''
      }));
    }

    if (field === 'isRecurring' && !value) {
      setFormData(prev => ({
        ...prev,
        recurrencePattern: ''
      }));
    }

    if (field === 'reminderSet' && !value) {
      setFormData(prev => ({
        ...prev,
        reminderTime: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
// Date validation
    if (formData.dueDate && formData.startDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        newErrors.dueDate = 'Due date cannot be before start date';
      }
    }

    if (formData.reminderTime && formData.startDate) {
      if (new Date(formData.reminderTime) < new Date(formData.startDate)) {
        newErrors.reminderTime = 'Reminder time cannot be before start date';
      }
    }
    
    // Conditional field validation
    if (formData.isRecurring && !formData.recurrencePattern) {
      newErrors.recurrencePattern = 'Recurrence pattern is required for recurring tasks';
    }
    
    if (formData.reminderSet && !formData.reminderTime) {
      newErrors.reminderTime = 'Reminder time is required when reminder is set';
    }

    if (formData.status === 'Completed' && !formData.completedDate) {
      newErrors.completedDate = 'Completed date is required for completed tasks';
    }

    if (formData.completedDate && formData.startDate) {
      if (new Date(formData.completedDate) < new Date(formData.startDate)) {
        newErrors.completedDate = 'Completed date cannot be before start date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const taskData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        contactId: formData.contactId ? parseInt(formData.contactId) : null,
        category: formData.category.trim(),
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern.trim(),
        completedDate: formData.completedDate ? new Date(formData.completedDate).toISOString() : null,
        reminderSet: formData.reminderSet,
        reminderTime: formData.reminderTime ? new Date(formData.reminderTime).toISOString() : null
      };
      
      await onSave(taskData);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Enter task subject"
                error={errors.subject}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter task description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                rows={3}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
onChange={(value) => handleChange('status', value)}
                options={statusOptions}
                disabled={loading}
              />
            </div>

<div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(value) => handleChange('priority', value)}
              options={priorityOptions}
              disabled={loading}
            />
          </div>

<div>
            <Label htmlFor="contactId">Assigned To (Contact)</Label>
            <Select
              id="contactId"
              value={formData.contactId}
              onChange={(value) => handleChange('contactId', value)}
              options={contactOptions}
              disabled={loading}
            />
          </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="Enter task category"
                disabled={loading}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                error={errors.dueDate}
                disabled={loading}
              />
            </div>

{formData.status === 'Completed' && (
              <div>
                <Label htmlFor="completedDate">Completed Date</Label>
                <Input
                  id="completedDate"
                  type="date"
                  value={formData.completedDate}
                  onChange={(e) => handleChange('completedDate', e.target.value)}
                  error={errors.completedDate}
                  disabled={loading}
                />
              </div>
            )}
          </div>

{/* Recurring Task Settings */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => handleChange('isRecurring', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
                disabled={loading}
              />
              <Label htmlFor="isRecurring">Recurring Task</Label>
            </div>

            {formData.isRecurring && (
              <div>
                <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
<Select
                  id="recurrencePattern"
                  value={formData.recurrencePattern}
                  onChange={(value) => handleChange('recurrencePattern', value)}
                  options={recurrenceOptions}
                  error={errors.recurrencePattern}
                  disabled={loading}
                />
              </div>
            )}
</div>

          {/* Reminder Settings */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="reminderSet"
                checked={formData.reminderSet}
                onChange={(e) => handleChange('reminderSet', e.target.checked)}
                className="rounded border-gray-300 text-primary focus:ring-primary"
                disabled={loading}
              />
              <Label htmlFor="reminderSet">Set Reminder</Label>
            </div>

            {formData.reminderSet && (
              <div>
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="datetime-local"
                  value={formData.reminderTime}
                  onChange={(e) => handleChange('reminderTime', e.target.value)}
                  error={errors.reminderTime}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set when you want to be reminded about this task
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading && <ApperIcon name="Loader2" size={16} className="animate-spin" />}
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TaskModal;