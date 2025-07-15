import React, { useState, useEffect } from "react";
import Modal from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const DealModal = ({ isOpen, onClose, deal, onSave, contacts }) => {
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    stage: "new",
    probability: "10",
    closeDate: "",
    contactId: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || "",
        value: deal.value?.toString() || "",
        stage: deal.stage || "new",
        probability: deal.probability?.toString() || "10",
        closeDate: deal.closeDate ? deal.closeDate.split("T")[0] : "",
        contactId: deal.contactId || "",
        notes: deal.notes || ""
      });
    } else {
      setFormData({
        title: "",
        value: "",
        stage: "new",
        probability: "10",
        closeDate: "",
        contactId: "",
        notes: ""
      });
    }
    setErrors({});
  }, [deal, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Value must be greater than 0";
    }

    if (!formData.contactId) {
      newErrors.contactId = "Contact is required";
    }

    if (!formData.closeDate) {
      newErrors.closeDate = "Close date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);
    try {
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        closeDate: new Date(formData.closeDate).toISOString()
      };

      await onSave(dealData);
      toast.success(deal ? "Deal updated successfully!" : "Deal created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save deal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stageOptions = [
    { value: "new", label: "New" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closed-won", label: "Closed Won" },
    { value: "closed-lost", label: "Closed Lost" }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={deal ? "Edit Deal" : "Create New Deal"}
      size="lg"
    >
<form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <FormField
            label="Deal Title"
            placeholder="Enter deal title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
          />

          <FormField
            label="Deal Value ($)"
            type="number"
            placeholder="0"
            value={formData.value}
            onChange={(e) => handleChange("value", e.target.value)}
            error={errors.value}
          />

          <FormField
            label="Stage"
            error={errors.stage}
          >
            <Select
              value={formData.stage}
              onChange={(e) => handleChange("stage", e.target.value)}
            >
              {stageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Probability (%)"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={(e) => handleChange("probability", e.target.value)}
            error={errors.probability}
          />

          <FormField
            label="Close Date"
            type="date"
            value={formData.closeDate}
            onChange={(e) => handleChange("closeDate", e.target.value)}
            error={errors.closeDate}
          />

          <FormField
            label="Contact"
            error={errors.contactId}
          >
            <Select
              value={formData.contactId}
              onChange={(e) => handleChange("contactId", e.target.value)}
            >
              <option value="">Select a contact</option>
              {contacts.map(contact => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.name} - {contact.company}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField
          label="Notes"
          type="textarea"
          placeholder="Add any additional notes about this deal..."
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          error={errors.notes}
        />

<div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px] order-2 sm:order-1"
          >
            Cancel
          </Button>
<Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px] min-w-[120px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 order-1 sm:order-2"
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" size={16} className="mr-2" />
                {deal ? "Update Deal" : "Create Deal"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DealModal;