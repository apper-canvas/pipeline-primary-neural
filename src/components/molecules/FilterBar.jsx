import React from "react";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = Object.values(filters).some(value => value && value !== "all");

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <ApperIcon name="Filter" size={16} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-700">Filters:</span>
      </div>
      
      <Select
        value={filters.stage || "all"}
        onChange={(e) => onFilterChange("stage", e.target.value)}
        className="w-40"
      >
        <option value="all">All Stages</option>
        <option value="new">New</option>
        <option value="qualified">Qualified</option>
        <option value="proposal">Proposal</option>
        <option value="negotiation">Negotiation</option>
        <option value="closed-won">Closed Won</option>
        <option value="closed-lost">Closed Lost</option>
      </Select>

      <Select
        value={filters.valueRange || "all"}
        onChange={(e) => onFilterChange("valueRange", e.target.value)}
        className="w-40"
      >
        <option value="all">All Values</option>
        <option value="0-10000">$0 - $10k</option>
        <option value="10000-50000">$10k - $50k</option>
        <option value="50000-100000">$50k - $100k</option>
        <option value="100000+">$100k+</option>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-gray-600 hover:text-gray-900"
        >
          <ApperIcon name="X" size={14} className="mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default FilterBar;