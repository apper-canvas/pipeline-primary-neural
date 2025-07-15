import React, { useState, useEffect } from "react";
import Modal from "@/components/atoms/Modal";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const ContactModal = ({ isOpen, onClose, contact, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        notes: contact.notes || ""
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: ""
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company is required";
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
      await onSave(formData);
      toast.success(contact ? "Contact updated successfully!" : "Contact created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save contact. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={contact ? "Edit Contact" : "Create New Contact"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4 lg:gap-6">
          <FormField
            label="Full Name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
          />
          <FormField
            label="Email Address"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />

<FormField
            label="Contact Type"
            type="select"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            error={errors.phone}
          >
            <option value="">Select contact type</option>
            <option value="office">Office</option>
            <option value="personal">Personal</option>
          </FormField>

          <FormField
            label="Company"
            placeholder="Enter company name"
            value={formData.company}
            onChange={(e) => handleChange("company", e.target.value)}
            error={errors.company}
          />
        </div>

        <FormField
          label="Notes"
          type="textarea"
          placeholder="Add any additional notes about this contact..."
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
            className="w-full sm:w-auto min-h-[44px] min-w-[140px] bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 order-1 sm:order-2"
          >
            {loading ? (
              <>
                <ApperIcon name="Loader2" size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ApperIcon name="Save" size={16} className="mr-2" />
                {contact ? "Update Contact" : "Create Contact"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactModal;