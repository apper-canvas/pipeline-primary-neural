import React, { useState, useEffect } from "react";
import DealCard from "@/components/organisms/DealCard";
import DealModal from "@/components/organisms/DealModal";
import FilterBar from "@/components/molecules/FilterBar";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { toast } from "react-toastify";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [filters, setFilters] = useState({
    stage: "all",
    valueRange: "all"
  });

  const stages = [
    { id: "new", name: "New", color: "border-blue-500 bg-blue-50" },
    { id: "qualified", name: "Qualified", color: "border-purple-500 bg-purple-50" },
    { id: "proposal", name: "Proposal", color: "border-yellow-500 bg-yellow-50" },
    { id: "negotiation", name: "Negotiation", color: "border-orange-500 bg-orange-50" },
    { id: "closed-won", name: "Closed Won", color: "border-green-500 bg-green-50" },
    { id: "closed-lost", name: "Closed Lost", color: "border-red-500 bg-red-50" }
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
      setError("Failed to load pipeline data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...deals];

    if (filters.stage !== "all") {
      filtered = filtered.filter(deal => deal.stage === filters.stage);
    }

    if (filters.valueRange !== "all") {
      const [min, max] = filters.valueRange.split("-").map(Number);
      if (max) {
        filtered = filtered.filter(deal => deal.value >= min && deal.value <= max);
      } else {
        filtered = filtered.filter(deal => deal.value >= min);
      }
    }

    setFilteredDeals(filtered);
  }, [deals, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ stage: "all", valueRange: "all" });
  };

  const handleCreateDeal = () => {
    setSelectedDeal(null);
    setIsDealModalOpen(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setIsDealModalOpen(true);
  };

  const handleSaveDeal = async (dealData) => {
    if (selectedDeal) {
      const updatedDeal = await dealService.update(selectedDeal.Id, dealData);
      setDeals(prev => prev.map(d => d.Id === selectedDeal.Id ? updatedDeal : d));
    } else {
      const newDeal = await dealService.create(dealData);
      setDeals(prev => [...prev, newDeal]);
    }
  };

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    
    if (!draggedDeal || draggedDeal.stage === newStage) {
      return;
    }

    try {
      const updatedDeal = await dealService.update(draggedDeal.Id, {
        ...draggedDeal,
        stage: newStage
      });
      
      setDeals(prev => prev.map(d => d.Id === draggedDeal.Id ? updatedDeal : d));
      toast.success(`Deal moved to ${newStage.replace("-", " ")}`);
    } catch (err) {
      toast.error("Failed to update deal stage");
    }
  };

  const getDealsByStage = (stageId) => {
    return filteredDeals.filter(deal => deal.stage === stageId);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageTotal = (stageId) => {
    const stageDeals = getDealsByStage(stageId);
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading type="pipeline" />
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Sales Pipeline
            </h1>
            <p className="text-gray-600 mt-2">Drag and drop deals between stages</p>
          </div>
          <Button
            onClick={handleCreateDeal}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Deal
          </Button>
        </div>

        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 p-6 overflow-x-auto">
        {deals.length === 0 ? (
          <Empty
            title="No deals in your pipeline"
            description="Start by creating your first deal to track your sales progress"
            actionLabel="Create Deal"
            onAction={handleCreateDeal}
            icon="GitBranch"
          />
        ) : (
          <div className="flex gap-6 h-full min-w-[1500px]">
            {stages.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              const stageTotal = getStageTotal(stage.id);

              return (
                <div
                  key={stage.id}
                  className="flex-1 min-w-[300px] flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className={`p-4 rounded-t-lg border-t-4 ${stage.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                      <span className="text-sm font-medium text-gray-600">
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(stageTotal)}
                    </p>
                  </div>

                  {/* Stage Content */}
                  <div className="flex-1 bg-gray-50 border-l border-r border-b border-gray-200 rounded-b-lg p-4 space-y-3 min-h-[500px] drop-zone">
                    {stageDeals.map((deal) => (
                      <DealCard
                        key={deal.Id}
                        deal={deal}
                        onClick={() => handleEditDeal(deal)}
                        onDragStart={() => handleDragStart(deal)}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedDeal?.Id === deal.Id}
                      />
                    ))}
                    
                    {stageDeals.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                        Drop deals here
                      </div>
                    )}
                  </div>
                </div>
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

export default Pipeline;