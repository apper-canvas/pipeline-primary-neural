import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { companyService } from '@/services/api/companyService';
import CompanyModal from '@/components/organisms/CompanyModal';
import Button from '@/components/atoms/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadCompanyData();
  }, [id]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const companyData = await companyService.getById(parseInt(id));
      setCompany(companyData);
    } catch (err) {
      console.error("Error loading company:", err);
      setError(err.message || "Failed to load company details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = () => {
    setShowEditModal(true);
  };

  const handleSaveCompany = async (companyData) => {
    try {
      const updatedCompany = await companyService.update(company.Id, companyData);
      setCompany(updatedCompany);
      toast.success("Company updated successfully");
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  };

  const handleDeleteCompany = async () => {
    if (!window.confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
      return;
    }

    try {
      await companyService.delete(company.Id);
      toast.success("Company deleted successfully");
      navigate('/companies');
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(error.message || "Failed to delete company");
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat('en-US').format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading type="cards" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Error message={error} onRetry={loadCompanyData} />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <Error message="Company not found" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link to="/companies" className="hover:text-primary transition-colors">
          Companies
        </Link>
        <ApperIcon name="ChevronRight" size={16} />
        <span className="text-gray-900 font-medium">{company.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl">
            {company.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            <p className="text-lg text-gray-600">{company.industry}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleEditCompany}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Edit" size={16} />
            <span>Edit</span>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteCompany}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Trash2" size={16} />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Building2" size={20} />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Industry</label>
                  <p className="text-base text-gray-900">{company.industry}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Size</label>
                  <p className="text-base text-gray-900">{company.size}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Founded</label>
                  <p className="text-base text-gray-900">{company.foundedYear}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employees</label>
                  <p className="text-base text-gray-900">{formatNumber(company.employees)}</p>
                </div>
              </div>
{company.lead_lookup_c && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Associated Lead</label>
                  <p className="text-base text-primary font-medium mt-1">{company.lead_lookup_c.Name}</p>
                </div>
              )}

              {company.deal_lookup_c && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Associated Deal</label>
                  <p className="text-base text-secondary font-medium mt-1">{company.deal_lookup_c.Name}</p>
                </div>
              )}
              {company.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-base text-gray-900 mt-1">{company.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Contact" size={20} />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="flex items-center space-x-2">
                    <ApperIcon name="Mail" size={16} className="text-gray-400" />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-base text-primary hover:underline"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
                {company.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Phone" size={16} className="text-gray-400" />
                      <a
                        href={`tel:${company.phone}`}
                        className="text-base text-primary hover:underline"
                      >
                        {company.phone}
                      </a>
                    </div>
                  </div>
                )}
                {company.website && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="Globe" size={16} className="text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              {company.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <div className="flex items-start space-x-2 mt-1">
                    <ApperIcon name="MapPin" size={16} className="text-gray-400 mt-0.5" />
                    <p className="text-base text-gray-900">{company.address}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="DollarSign" size={20} />
                <span>Financial Info</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Annual Revenue</label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(company.revenue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="BarChart3" size={20} />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Users" size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800">Employees</span>
                </div>
                <span className="font-semibold text-blue-900">
                  {formatNumber(company.employees)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Calendar" size={16} className="text-green-600" />
                  <span className="text-sm text-green-800">Founded</span>
                </div>
                <span className="font-semibold text-green-900">{company.foundedYear}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Building" size={16} className="text-purple-600" />
                  <span className="text-sm text-purple-800">Size</span>
                </div>
                <span className="font-semibold text-purple-900">{company.size}</span>
              </div>
            </CardContent>
          </Card>

          {/* Creation Date */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">Added to CRM</p>
                <p className="text-base font-medium text-gray-900">
                  {format(new Date(company.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <CompanyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        company={company}
        onSave={handleSaveCompany}
      />
    </div>
  );
}

export default CompanyDetail;