import React, { useState, useEffect } from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import { contactService } from '@/services/api/contactService';
import { activityService } from '@/services/api/activityService';

const MeetingSchedulerModal = ({ isOpen, onClose, onSuccess, userId }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    participants: [],
    scheduledDate: '',
    scheduledTime: '',
    location: '',
    agenda: '',
    duration: 60,
    meetingType: 'in-person'
  });

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      const contactsData = await contactService.getAll();
      setContacts(contactsData);
    } catch (error) {
      toast.error('Failed to load contacts');
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

  const handleParticipantChange = (contactId) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.includes(contactId)
        ? prev.participants.filter(id => id !== contactId)
        : [...prev.participants, contactId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    }
    
    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Meeting date is required';
    }
    
    if (!formData.scheduledTime) {
      newErrors.scheduledTime = 'Meeting time is required';
    }
    
    if (formData.participants.length === 0) {
      newErrors.participants = 'At least one participant is required';
    }
    
    if (!formData.location.trim() && formData.meetingType === 'in-person') {
      newErrors.location = 'Location is required for in-person meetings';
    }
    
    if (!formData.agenda.trim()) {
      newErrors.agenda = 'Meeting agenda is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const selectedContacts = contacts.filter(c => formData.participants.includes(c.Id));
      const participantNames = selectedContacts.map(c => c.name).join(', ');
      
      // Create calendar event ID simulation
      const calendarEventId = `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Combine date and time
      const meetingDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const meetingData = {
        type: 'meeting',
        title: formData.title,
        description: `Meeting: ${formData.title}\nParticipants: ${participantNames}\nAgenda: ${formData.agenda}`,
        participants: formData.participants,
        scheduledDate: meetingDateTime.toISOString(),
        location: formData.location,
        agenda: formData.agenda,
        duration: parseInt(formData.duration),
        meetingType: formData.meetingType,
        calendarEventId: calendarEventId,
        invitationsSent: true,
        userId: userId,
        outcome: 'scheduled'
      };
      
      await activityService.create(meetingData);
      
      // Simulate sending invitations
      const invitationPromises = selectedContacts.map(contact => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      await Promise.all(invitationPromises);
      
      toast.success(`Meeting "${formData.title}" scheduled successfully! Calendar invitations sent to ${participantNames}.`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    } catch (error) {
      toast.error('Failed to schedule meeting: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      participants: [],
      scheduledDate: '',
      scheduledTime: '',
      location: '',
      agenda: '',
      duration: 60,
      meetingType: 'in-person'
    });
    setErrors({});
    onClose();
  };

  const meetingTypeOptions = [
    { value: 'in-person', label: 'In-Person Meeting' },
    { value: 'virtual', label: 'Virtual Meeting' },
    { value: 'phone', label: 'Phone Call' }
  ];

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Schedule Meeting"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Meeting Title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Weekly Team Standup"
            error={errors.title}
            required
          />
          
          <FormField
            label="Meeting Type"
            type="select"
            value={formData.meetingType}
            onChange={(e) => handleChange('meetingType', e.target.value)}
            error={errors.meetingType}
          >
            {meetingTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Date"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => handleChange('scheduledDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            error={errors.scheduledDate}
            required
          />
          
          <FormField
            label="Time"
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => handleChange('scheduledTime', e.target.value)}
            error={errors.scheduledTime}
            required
          />
          
          <FormField
            label="Duration"
            type="select"
            value={formData.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            error={errors.duration}
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormField>
        </div>

        <FormField
          label="Location"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder={formData.meetingType === 'virtual' ? 'e.g., Zoom link, Teams meeting' : 'e.g., Conference Room A, Client Office'}
          error={errors.location}
          required={formData.meetingType === 'in-person'}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Participants <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
            {contacts.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading contacts...</p>
            ) : (
              <div className="space-y-2">
                {contacts.map(contact => (
                  <label key={contact.Id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.participants.includes(contact.Id)}
                      onChange={() => handleParticipantChange(contact.Id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">{contact.name}</span>
                    <span className="text-xs text-gray-500">({contact.email})</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {errors.participants && (
            <p className="text-sm text-error font-medium">{errors.participants}</p>
          )}
        </div>

        <FormField
          label="Agenda"
          type="textarea"
          value={formData.agenda}
          onChange={(e) => handleChange('agenda', e.target.value)}
          placeholder="Meeting agenda and topics to discuss..."
          error={errors.agenda}
          required
          className="min-h-[100px]"
        />

        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <ApperIcon name="Calendar" size={16} className="mr-2" />
                Schedule Meeting
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MeetingSchedulerModal;