import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const DealCard = ({ deal, onClick, onDragStart, onDragEnd, isDragging }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return "success";
    if (probability >= 50) return "warning";
    return "error";
  };

  const getStageColor = (stage) => {
    const colors = {
      "new": "default",
      "qualified": "secondary",
      "proposal": "warning",
      "negotiation": "success",
      "closed-won": "success",
      "closed-lost": "error"
    };
    return colors[stage] || "default";
  };

  return (
    <Card
      className={`cursor-move transition-all duration-200 hover:shadow-lg border-l-4 ${
        isDragging ? "opacity-50 rotate-2 scale-105" : ""
      } ${
        deal.stage === "new" ? "border-l-blue-500" :
        deal.stage === "qualified" ? "border-l-purple-500" :
        deal.stage === "proposal" ? "border-l-yellow-500" :
        deal.stage === "negotiation" ? "border-l-orange-500" :
        deal.stage === "closed-won" ? "border-l-green-500" :
        "border-l-red-500"
      }`}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 line-clamp-2 flex-1">
              {deal.title}
            </h4>
            <Badge variant={getStageColor(deal.stage)} className="ml-2 text-xs">
              {deal.stage.replace("-", " ").toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium text-lg text-gray-900">
              {formatCurrency(deal.value)}
            </span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                deal.probability >= 80 ? "bg-success" :
                deal.probability >= 50 ? "bg-warning" :
                "bg-error"
              }`} />
              <span className="text-xs">{deal.probability}%</span>
            </div>
          </div>

          {deal.closeDate && (
            <div className="flex items-center text-xs text-gray-500">
              <ApperIcon name="Calendar" size={12} className="mr-1" />
              <span>Close: {format(new Date(deal.closeDate), "MMM d, yyyy")}</span>
            </div>
          )}

          {deal.notes && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {deal.notes}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
<div className="flex items-center text-xs text-gray-500">
              <ApperIcon name="User" size={12} className="mr-1" />
              <span>Contact: {deal.contactId?.Name || 'No contact'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ApperIcon name="MoreHorizontal" size={14} className="text-gray-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DealCard;