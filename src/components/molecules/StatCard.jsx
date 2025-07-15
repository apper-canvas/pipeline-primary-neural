import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ title, value, icon, trend, trendValue, className }) => {
  const getTrendColor = () => {
    if (!trend) return "text-gray-500";
    return trend === "up" ? "text-success" : "text-error";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === "up" ? "TrendingUp" : "TrendingDown";
  };

  return (
    <Card className={cn("hover:shadow-lg transition-all duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <div className={cn("flex items-center mt-2 text-sm", getTrendColor())}>
                <ApperIcon name={getTrendIcon()} size={14} className="mr-1" />
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} size={24} className="text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;