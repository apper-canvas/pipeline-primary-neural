import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import DealModal from "@/components/organisms/DealModal";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import SearchBar from "@/components/molecules/SearchBar";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");

  const stages = [
    { id: "new", name: "New", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { id: "qualified", name: "Qualified", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { id: "proposal", name: "Proposal", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { id: "negotiation", name: "Negotiation", color: "bg-orange-100 text-orange-800 border-orange-200" },
    { id: "closed-won", name: "Closed Won", color: "bg-green-100 text-green-800 border-green-200" },
    { id: "closed-lost", name: "Closed Lost", color: "bg-red-100 text-red-800 border-red-200" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll()
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load deals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...deals];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by stage
    if (stageFilter !== "all") {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }

    setFilteredDeals(filtered);
  }, [deals, searchTerm, stageFilter]);

  const handleCreateDeal = () => {
    setSelectedDeal(null);
    setIsDealModalOpen(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  const handleSaveDeal = async (dealData) => {
    try {
      if (selectedDeal) {
        const updatedDeal = await dealService.update(selectedDeal.Id, dealData);
        if (updatedDeal) {
          setDeals(prev => prev.map(d => d.Id === selectedDeal.Id ? updatedDeal : d));
          toast.success("Deal updated successfully");
        }
      } else {
        const newDeal = await dealService.create(dealData);
        if (newDeal) {
          setDeals(prev => [...prev, newDeal]);
          toast.success("Deal created successfully");
        }
      }
      setIsDealModalOpen(false);
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error("Failed to save deal");
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!confirm("Are you sure you want to delete this deal?")) {
      return;
    }

    try {
      const success = await dealService.delete(dealId);
      if (success) {
        setDeals(prev => prev.filter(d => d.Id !== dealId));
        toast.success("Deal deleted successfully");
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      toast.error("Failed to delete deal");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageInfo = (stageId) => {
    return stages.find(stage => stage.id === stageId) || stages[0];
  };

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : "Unknown";
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading type="deals" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Error message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Deals
            </h1>
            <p className="text-gray-600 mt-2">Manage your deals and track progress</p>
          </div>
          <Button
            onClick={handleCreateDeal}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105 w-full lg:w-auto"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Deal
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search deals by title or company..."
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Stages</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Deals List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {deals.length === 0 ? (
          <Empty
            title="No deals found"
            description="Start by creating your first deal to track your sales progress"
            actionLabel="Create Deal"
            onAction={handleCreateDeal}
            icon="Briefcase"
          />
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <ApperIcon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals match your search</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDeals.map((deal) => {
              const stageInfo = getStageInfo(deal.stage);
              return (
                <Card
                  key={deal.Id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-primary"
                  onClick={() => handleEditDeal(deal)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {deal.title}
                          </h3>
                          <div className="flex items-center gap-2 ml-4">
                            <Badge className={stageInfo.color}>
                              {stageInfo.name}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <ApperIcon name="Building2" size={16} className="mr-2 text-gray-400" />
                            <span>{deal.company || "No company"}</span>
                          </div>
                          <div className="flex items-center">
                            <ApperIcon name="User" size={16} className="mr-2 text-gray-400" />
                            <span>{getContactName(deal.contactId)}</span>
                          </div>
                          <div className="flex items-center">
                            <ApperIcon name="DollarSign" size={16} className="mr-2 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(deal.value)}
                            </span>
                          </div>
                        </div>

                        {deal.description && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {deal.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditDeal(deal);
                          }}
                          className="text-gray-500 hover:text-primary"
                        >
                          <ApperIcon name="Edit3" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDeal(deal.Id);
                          }}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Deal Modal */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        deal={selectedDeal}
        onSave={handleSaveDeal}
        contacts={contacts}
      />
    </div>
  );
};

export default Deals;