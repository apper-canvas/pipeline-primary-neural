import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import companyService from "@/services/api/companyService";
import ApperIcon from "@/components/ApperIcon";
import CompanyModal from "@/components/organisms/CompanyModal";
import SearchBar from "@/components/molecules/SearchBar";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Card, { CardContent } from "@/components/atoms/Card";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const companiesData = await companyService.getAll();
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error loading companies:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort companies
  let filteredCompanies = [...companies];

  // Apply search filter
if (searchQuery.trim()) {
    filteredCompanies = filteredCompanies.filter(company =>
      company.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.deal_lookup_c?.Name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply sorting
  filteredCompanies.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle numeric values
    if (sortBy === "revenue" || sortBy === "employees" || sortBy === "foundedYear") {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    } else {
      // Handle string values
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCreateCompany = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  const handleSaveCompany = async (companyData) => {
    try {
      if (selectedCompany) {
        const updatedCompany = await companyService.update(selectedCompany.Id, companyData);
        if (updatedCompany) {
          setCompanies(prev => prev.map(c => c.Id === selectedCompany.Id ? updatedCompany : c));
          toast.success("Company updated successfully");
        }
      } else {
        const newCompany = await companyService.create(companyData);
        if (newCompany) {
          setCompanies(prev => [...prev, newCompany]);
          toast.success("Company created successfully");
        }
      }
    } catch (error) {
      console.error("Error saving company:", error);
      throw error;
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      await companyService.delete(companyId);
      setCompanies(prev => prev.filter(c => c.Id !== companyId));
      toast.success("Company deleted successfully");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return "ArrowUpDown";
    return sortOrder === "asc" ? "ArrowUp" : "ArrowDown";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600">Manage your company records and relationships</p>
          </div>
          <Button onClick={handleCreateCompany} className="flex items-center space-x-2">
            <ApperIcon name="Plus" size={16} />
            <span>Add Company</span>
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search companies by name, industry, or website..."
            />
          </div>
        </div>
      </div>

      {filteredCompanies.length === 0 ? (
        <Empty 
          message={searchQuery ? "No companies match your search" : "No companies found"}
          actionLabel={searchQuery ? "Clear search" : "Add your first company"}
          onAction={searchQuery ? () => setSearchQuery("") : handleCreateCompany}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("name")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Company Name</span>
                        <ApperIcon name={getSortIcon("name")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("industry")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Industry</span>
                        <ApperIcon name={getSortIcon("industry")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("size")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Size</span>
                        <ApperIcon name={getSortIcon("size")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("website")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Website</span>
                        <ApperIcon name={getSortIcon("website")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("phone")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Phone</span>
                        <ApperIcon name={getSortIcon("phone")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("employees")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Employees</span>
                        <ApperIcon name={getSortIcon("employees")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={() => handleSort("revenue")}
                        className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                      >
                        <span>Revenue</span>
                        <ApperIcon name={getSortIcon("revenue")} size={12} />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
{filteredCompanies.map((company) => (
                    <tr key={company.Id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                              {company.name?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Link 
                              to={`/companies/${company.Id}`}
                              className="text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                            >
                              {company.name}
                            </Link>
<div className="text-sm text-gray-500">
                              {company.lead_lookup_c?.Name ? (
                                <span className="text-primary">Lead: {company.lead_lookup_c.Name}</span>
                              ) : company.deal_lookup_c?.Name ? (
                                <span className="text-secondary">Deal: {company.deal_lookup_c.Name}</span>
                              ) : (
                                company.email
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.size === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                          company.size === 'Large' ? 'bg-blue-100 text-blue-800' :
                          company.size === 'Medium' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {company.size}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:text-primary-dark underline"
                          >
                            {company.website.replace(/^https?:\/\//, '')}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.phone || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{company.employees?.toLocaleString() || '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(company.revenue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="text-primary hover:text-primary-dark"
                            title="Edit company"
                          >
                            <ApperIcon name="Edit" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.Id)}
                            className="text-error hover:text-red-700"
                            title="Delete company"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={selectedCompany}
        onSave={handleSaveCompany}
      />
    </div>
  );
}

export default Companies;