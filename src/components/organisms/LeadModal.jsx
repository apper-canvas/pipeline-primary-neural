import React, { useState, useEffect } from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';

const LeadModal = ({ isOpen, onClose, lead, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: 'manual',
    priority: 'medium',
    notes: '',
    assignedTo: 'Unassigned'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        status: lead.status || 'new',
        source: lead.source || 'manual',
        priority: lead.priority || 'medium',
        notes: lead.notes || '',
        assignedTo: lead.assignedTo || 'Unassigned'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'new',
        source: 'manual',
        priority: 'medium',
        notes: '',
        assignedTo: 'Unassigned'
      });
    }
    setErrors({});
  }, [lead, isOpen]);

  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'nurturing', label: 'Nurturing' },
    { value: 'converted', label: 'Converted' },
    { value: 'lost', label: 'Lost' }
  ];

  const sourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email_campaign', label: 'Email Campaign' },
    { value: 'trade_show', label: 'Trade Show' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'manual', label: 'Manual Entry' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const assignedToOptions = [
    { value: 'Unassigned', label: 'Unassigned' },
    { value: 'John Doe', label: 'John Doe' },
    { value: 'Jane Smith', label: 'Jane Smith' },
    { value: 'Mike Johnson', label: 'Mike Johnson' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
}
    
    if (formData.phone && !/^[+]?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
      toast.success(lead ? 'Lead updated successfully!' : 'Lead created successfully!');
      onClose();
    } catch (error) {
      toast.error(error.message || 'An error occurred while saving the lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 bg-blue-50';
      case 'contacted':
        return 'text-purple-600 bg-purple-50';
      case 'qualified':
        return 'text-green-600 bg-green-50';
      case 'nurturing':
        return 'text-yellow-600 bg-yellow-50';
      case 'converted':
        return 'text-emerald-600 bg-emerald-50';
      case 'lost':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {lead ? 'Edit Lead' : 'Add New Lead'}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <ApperIcon name="X" size={20} />
        </Button>
      </div>

<form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 lg:gap-6">
          <FormField
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            placeholder="Enter lead name"
          />
          
          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
            placeholder="Enter email address"
          />
          
          <FormField
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="Enter phone number"
          />
          
          <FormField
            label="Company"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Enter company name"
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <Select
              value={formData.status}
              onChange={(value) => handleChange('status', value)}
              options={statusOptions}
              placeholder="Select status"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <Select
              value={formData.source}
              onChange={(value) => handleChange('source', value)}
              options={sourceOptions}
              placeholder="Select source"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <Select
              value={formData.priority}
              onChange={(value) => handleChange('priority', value)}
              options={priorityOptions}
              placeholder="Select priority"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Assigned To</label>
            <Select
              value={formData.assignedTo}
              onChange={(value) => handleChange('assignedTo', value)}
              options={assignedToOptions}
              placeholder="Select assignee"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Add any additional notes about this lead..."
          />
        </div>

<div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] order-2 sm:order-1"
          >
            Cancel
          </Button>
<Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] min-w-[120px] order-1 sm:order-2"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <ApperIcon name="Loader2" size={16} className="animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              lead ? 'Update Lead' : 'Create Lead'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadModal;