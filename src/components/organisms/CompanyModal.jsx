import React, { useState, useEffect } from 'react';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import { toast } from 'react-toastify';
import leadService from '@/services/api/leadService';
import { dealService } from '@/services/api/dealService';
function CompanyModal({ isOpen, onClose, company, onSave }) {
const [formData, setFormData] = useState({
    name: "",
    industry: "",
    size: "Small",
    website: "",
    phone: "",
    email: "",
    address: "",
    description: "",
    foundedYear: new Date().getFullYear(),
    revenue: "",
    employees: "",
    lead_lookup_c: "",
    deal_lookup_c: ""
  });

  const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
useEffect(() => {
    loadLeads();
    loadDeals();
  }, []);

  useEffect(() => {
if (company) {
      setFormData({
        name: company.name || "",
        industry: company.industry || "",
        size: company.size || "Small",
        website: company.website || "",
        phone: company.phone || "",
        email: company.email || "",
        address: company.address || "",
        description: company.description || "",
        foundedYear: company.foundedYear || new Date().getFullYear(),
        revenue: company.revenue || "",
        employees: company.employees || "",
        lead_lookup_c: company.lead_lookup_c?.Id || "",
        deal_lookup_c: company.deal_lookup_c?.Id || ""
      });
    } else {
      setFormData({
        name: "",
        industry: "",
        size: "Small",
        website: "",
        phone: "",
        email: "",
        address: "",
        description: "",
        foundedYear: new Date().getFullYear(),
        revenue: "",
        employees: "",
        lead_lookup_c: "",
        deal_lookup_c: ""
      });
    }
    setErrors({});
  }, [company, isOpen]);

const loadLeads = async () => {
    try {
      setLoadingLeads(true);
      const leadsData = await leadService.getAll();
      setLeads(leadsData);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoadingLeads(false);
    }
  };

  const loadDeals = async () => {
    try {
      setLoadingDeals(true);
      const dealsData = await dealService.getAll();
      setDeals(dealsData);
    } catch (error) {
      console.error("Error loading deals:", error);
      toast.error("Failed to load deals");
    } finally {
      setLoadingDeals(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }

    if (!formData.industry.trim()) {
      newErrors.industry = "Industry is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = "Please enter a valid website URL (include http:// or https://)";
    }

    if (formData.foundedYear && (formData.foundedYear < 1800 || formData.foundedYear > new Date().getFullYear())) {
      newErrors.foundedYear = "Please enter a valid founding year";
    }

    if (formData.revenue && formData.revenue < 0) {
      newErrors.revenue = "Revenue cannot be negative";
    }

    if (formData.employees && formData.employees < 1) {
      newErrors.employees = "Number of employees must be at least 1";
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
const companyData = {
        ...formData,
        foundedYear: parseInt(formData.foundedYear) || new Date().getFullYear(),
        revenue: parseFloat(formData.revenue) || 0,
        employees: parseInt(formData.employees) || 1,
        lead_lookup_c: formData.lead_lookup_c ? parseInt(formData.lead_lookup_c) : null,
        deal_lookup_c: formData.deal_lookup_c ? parseInt(formData.deal_lookup_c) : null
      };

      await onSave(companyData);
      onClose();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error(error.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {company ? 'Edit Company' : 'Create New Company'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Company Name"
              placeholder="Enter company name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              error={errors.name}
            />

            <FormField
              label="Industry"
              placeholder="Enter industry"
              value={formData.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              error={errors.industry}
            />

            <FormField
              label="Company Size"
              type="select"
              value={formData.size}
              onChange={(e) => handleChange("size", e.target.value)}
              error={errors.size}
            >
              <option value="Small">Small (1-50 employees)</option>
              <option value="Medium">Medium (51-200 employees)</option>
              <option value="Large">Large (201-1000 employees)</option>
              <option value="Enterprise">Enterprise (1000+ employees)</option>
            </FormField>

            <FormField
              label="Website"
              placeholder="https://company.com"
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
              error={errors.website}
            />

            <FormField
              label="Phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              error={errors.phone}
            />

            <FormField
              label="Email"
              type="email"
              placeholder="company@example.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={errors.email}
            />

            <FormField
              label="Founded Year"
              type="number"
              placeholder="2020"
              value={formData.foundedYear}
              onChange={(e) => handleChange("foundedYear", e.target.value)}
              error={errors.foundedYear}
            />

            <FormField
              label="Number of Employees"
              type="number"
              placeholder="50"
              value={formData.employees}
              onChange={(e) => handleChange("employees", e.target.value)}
              error={errors.employees}
            />

            <FormField
              label="Annual Revenue ($)"
              type="number"
              placeholder="1000000"
              value={formData.revenue}
              onChange={(e) => handleChange("revenue", e.target.value)}
              error={errors.revenue}
            />
<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Associated Lead</label>
              <Select
                value={formData.lead_lookup_c}
                onChange={(e) => handleChange("lead_lookup_c", e.target.value)}
                disabled={loadingLeads}
                className={errors.lead_lookup_c ? "border-red-300" : ""}
              >
                <option value="">No Lead Selected</option>
                {leads.map(lead => (
                  <option key={lead.Id} value={lead.Id.toString()}>
                    {lead.Name}
                  </option>
                ))}
              </Select>
              {errors.lead_lookup_c && (
                <p className="mt-1 text-sm text-red-600">{errors.lead_lookup_c}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Associated Deal</label>
              <Select
                value={formData.deal_lookup_c}
                onChange={(e) => handleChange("deal_lookup_c", e.target.value)}
                disabled={loadingDeals}
                className={errors.deal_lookup_c ? "border-red-300" : ""}
              >
                <option value="">No Deal Selected</option>
                {deals.map(deal => (
                  <option key={deal.Id} value={deal.Id.toString()}>
                    {deal.title} - ${deal.value?.toLocaleString() || 0}
                  </option>
                ))}
              </Select>
              {errors.deal_lookup_c && (
                <p className="mt-1 text-sm text-red-600">{errors.deal_lookup_c}</p>
              )}
            </div>
          </div>

          <FormField
            label="Address"
            placeholder="Enter company address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            error={errors.address}
          />

          <FormField
            label="Description"
            type="textarea"
            placeholder="Brief description of the company..."
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={errors.description}
          />
          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{company ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                company ? 'Update Company' : 'Create Company'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default CompanyModal;