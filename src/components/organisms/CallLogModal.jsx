import React, { useState, useEffect } from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { contactService } from '@/services/api/contactService';
import { activityService } from '@/services/api/activityService';

const CallLogModal = ({ isOpen, onClose, onSuccess, userId }) => {
  const [formData, setFormData] = useState({
    contactId: '',
    duration: '',
    type: 'outbound',
    outcome: 'completed',
    notes: '',
    followUpStatus: 'none',
    followUpDate: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadContacts();
      // Reset form when modal opens
      setFormData({
        contactId: '',
        duration: '',
        type: 'outbound',
        outcome: 'completed',
        notes: '',
        followUpStatus: 'none',
        followUpDate: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      setLoadingContacts(true);
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
    }

    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0 minutes';
    }

    if (formData.followUpStatus === 'scheduled' && !formData.followUpDate) {
      newErrors.followUpDate = 'Follow-up date is required when follow-up is scheduled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const selectedContact = contacts.find(c => c.Id === parseInt(formData.contactId));
      
      const callLogData = {
        type: 'call',
        description: `${formData.type === 'inbound' ? 'Incoming' : 'Outgoing'} call with ${selectedContact?.name || 'Contact'}`,
        contactId: parseInt(formData.contactId),
        userId: userId,
        duration: parseInt(formData.duration),
        callType: formData.type,
        outcome: formData.outcome,
        notes: formData.notes,
        followUpStatus: formData.followUpStatus,
        followUpDate: formData.followUpStatus === 'scheduled' ? formData.followUpDate : null,
        dealId: null // Can be enhanced to link to deals if needed
      };

      await activityService.create(callLogData);
      
      toast.success('Call logged successfully');
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to log call: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const callTypeOptions = [
    { value: 'outbound', label: 'Outbound Call' },
    { value: 'inbound', label: 'Inbound Call' }
  ];

  const outcomeOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'no_answer', label: 'No Answer' },
    { value: 'voicemail', label: 'Left Voicemail' },
    { value: 'busy', label: 'Busy' },
    { value: 'callback_requested', label: 'Callback Requested' }
  ];

  const followUpOptions = [
    { value: 'none', label: 'No Follow-up' },
    { value: 'required', label: 'Follow-up Required' },
    { value: 'scheduled', label: 'Follow-up Scheduled' }
  ];

  const contactOptions = contacts.map(contact => ({
    value: contact.Id.toString(),
    label: `${contact.name} - ${contact.company}`
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Log Call"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Contact"
            type="select"
            value={formData.contactId}
            onChange={(value) => handleChange('contactId', value)}
            error={errors.contactId}
            options={contactOptions}
            placeholder={loadingContacts ? "Loading contacts..." : "Select contact"}
            disabled={loadingContacts}
            required
          />

          <FormField
            label="Duration (minutes)"
            type="number"
            value={formData.duration}
            onChange={(value) => handleChange('duration', value)}
            error={errors.duration}
            placeholder="e.g., 15"
            min="1"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Call Type"
            type="select"
            value={formData.type}
            onChange={(value) => handleChange('type', value)}
            options={callTypeOptions}
            required
          />

          <FormField
            label="Call Outcome"
            type="select"
            value={formData.outcome}
            onChange={(value) => handleChange('outcome', value)}
            options={outcomeOptions}
            required
          />
        </div>

        <FormField
          label="Notes"
          type="textarea"
          value={formData.notes}
          onChange={(value) => handleChange('notes', value)}
          placeholder="Call summary, key points discussed, next steps..."
          rows={4}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Follow-up Status"
            type="select"
            value={formData.followUpStatus}
            onChange={(value) => handleChange('followUpStatus', value)}
            options={followUpOptions}
          />

          {formData.followUpStatus === 'scheduled' && (
            <FormField
              label="Follow-up Date"
              type="datetime-local"
              value={formData.followUpDate}
              onChange={(value) => handleChange('followUpDate', value)}
              error={errors.followUpDate}
              required
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
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
            loading={loading}
            disabled={loading || loadingContacts}
          >
            <ApperIcon name="Phone" size={16} className="mr-2" />
            Log Call
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CallLogModal;