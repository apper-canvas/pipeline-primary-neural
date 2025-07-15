import React, { useState, useEffect } from "react";
import Modal from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { activityService } from "@/services/api/activityService";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";
import { format, addDays } from "date-fns";

const EmailFollowUpModal = ({ isOpen, onClose, dealId, onFollowUpScheduled }) => {
  const [formData, setFormData] = useState({
    subject: "",
    template: "",
    scheduledDate: "",
    priority: "medium",
    notes: ""
  });
  const [deal, setDeal] = useState(null);
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState([]);
  const [activeTab, setActiveTab] = useState("schedule");

  const emailTemplates = [
    {
      id: "initial",
      name: "Initial Follow-up",
      subject: "Following up on our conversation",
      body: "Hi {{contactName}},\n\nThank you for taking the time to discuss {{dealTitle}} with me. I wanted to follow up on our conversation and see if you have any questions.\n\nPlease let me know if you'd like to schedule a follow-up call to discuss next steps.\n\nBest regards"
    },
    {
      id: "proposal",
      name: "Proposal Follow-up",
      subject: "Proposal for {{dealTitle}} - Next Steps",
      body: "Hi {{contactName}},\n\nI hope this email finds you well. I wanted to follow up on the proposal we sent for {{dealTitle}}.\n\nHave you had a chance to review the details? I'd be happy to schedule a call to discuss any questions you might have.\n\nLooking forward to hearing from you.\n\nBest regards"
    },
    {
      id: "meeting",
      name: "Meeting Follow-up",
      subject: "Thank you for the meeting - {{dealTitle}}",
      body: "Hi {{contactName}},\n\nThank you for the productive meeting about {{dealTitle}}. I wanted to recap the key points we discussed and outline the next steps.\n\nKey takeaways:\n• [Point 1]\n• [Point 2]\n• [Point 3]\n\nNext steps:\n• [Action 1]\n• [Action 2]\n\nPlease let me know if I missed anything or if you have any questions.\n\nBest regards"
    },
    {
      id: "check_in",
      name: "Check-in Follow-up",
      subject: "Checking in on {{dealTitle}}",
      body: "Hi {{contactName}},\n\nI hope you're doing well. I wanted to check in regarding {{dealTitle}} and see if there's anything I can help with.\n\nIf you have any questions or need additional information, please don't hesitate to reach out.\n\nBest regards"
    }
  ];

  const priorityOptions = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" }
  ];

  const loadData = async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      const [dealData, followUpsData] = await Promise.all([
        dealService.getById(dealId),
        activityService.getFollowUpsByDeal(dealId)
      ]);
      
      setDeal(dealData);
      setFollowUps(followUpsData);
      
      if (dealData.contactId) {
        const contactData = await contactService.getById(dealData.contactId);
        setContact(contactData);
      }
    } catch (error) {
      toast.error("Failed to load deal information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && dealId) {
      loadData();
      // Set default scheduled date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData(prev => ({
        ...prev,
        scheduledDate: format(tomorrow, "yyyy-MM-dd")
      }));
    }
  }, [isOpen, dealId]);

  const handleTemplateSelect = (template) => {
    const personalizedSubject = template.subject
      .replace("{{contactName}}", contact?.name || "")
      .replace("{{dealTitle}}", deal?.title || "");
    
    setFormData(prev => ({
      ...prev,
      subject: personalizedSubject,
      template: template.body
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.scheduledDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      await activityService.createEmailFollowUp({
        dealId: parseInt(dealId),
        contactId: contact?.Id,
        subject: formData.subject,
        template: formData.template,
        scheduledDate: formData.scheduledDate,
        priority: formData.priority,
        notes: formData.notes,
        status: "scheduled"
      });

      toast.success("Email follow-up scheduled successfully");
      onFollowUpScheduled?.();
      onClose();
      
      // Reset form
      setFormData({
        subject: "",
        template: "",
        scheduledDate: "",
        priority: "medium",
        notes: ""
      });
      
    } catch (error) {
      toast.error("Failed to schedule follow-up");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (followUpId, newStatus) => {
    try {
      await activityService.updateFollowUpStatus(followUpId, newStatus);
      toast.success("Follow-up status updated");
      loadData();
    } catch (error) {
      toast.error("Failed to update follow-up status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "sent": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = (scheduledDate) => {
    return new Date(scheduledDate) < new Date() && new Date(scheduledDate).toDateString() !== new Date().toDateString();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email Follow-up Manager"
      size="lg"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "schedule"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            <ApperIcon name="Calendar" size={16} className="mr-2 inline" />
            Schedule Follow-up
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "manage"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            <ApperIcon name="List" size={16} className="mr-2 inline" />
            Manage Follow-ups
          </button>
        </div>

        {/* Deal Information */}
        {deal && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <ApperIcon name="Briefcase" size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{deal.title}</h3>
                  <p className="text-sm text-gray-600">
                    {contact?.name} • {deal.value ? `$${deal.value.toLocaleString()}` : 'No value set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "schedule" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Email Templates
              </label>
              <div className="grid grid-cols-2 gap-3">
                {emailTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                  >
                    <div className="font-medium text-sm text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {template.subject}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
                placeholder="Email subject line"
              />
              <FormField
                label="Scheduled Date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                required
              />
            </div>

            <FormField
              label="Priority"
              type="select"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
              options={priorityOptions}
            />

            <FormField
              label="Email Template"
              type="textarea"
              value={formData.template}
              onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
              placeholder="Email content..."
              rows={6}
            />

            <FormField
              label="Notes"
              type="textarea"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Internal notes about this follow-up..."
              rows={3}
            />

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                <ApperIcon name="Send" size={16} className="mr-2" />
                Schedule Follow-up
              </Button>
            </div>
          </form>
        )}

        {activeTab === "manage" && (
          <div className="space-y-4">
            {followUps.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ApperIcon name="Calendar" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups scheduled</h3>
                  <p className="text-gray-600">Schedule your first email follow-up using the form above</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {followUps.map((followUp) => (
                  <Card key={followUp.Id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge 
                              variant={followUp.status === "overdue" ? "destructive" : "default"}
                              className={getStatusColor(followUp.status)}
                            >
                              {followUp.status}
                            </Badge>
                            <Badge className={priorityOptions.find(p => p.value === followUp.priority)?.color}>
                              {followUp.priority} priority
                            </Badge>
                            {isOverdue(followUp.scheduledDate) && followUp.status === "scheduled" && (
                              <Badge variant="destructive">Overdue</Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{followUp.subject}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Scheduled: {format(new Date(followUp.scheduledDate), "MMM d, yyyy")}
                          </p>
                          {followUp.notes && (
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {followUp.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {followUp.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(followUp.Id, "sent")}
                              >
                                <ApperIcon name="Check" size={14} className="mr-1" />
                                Mark Sent
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(followUp.Id, "cancelled")}
                              >
                                <ApperIcon name="X" size={14} className="mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EmailFollowUpModal;