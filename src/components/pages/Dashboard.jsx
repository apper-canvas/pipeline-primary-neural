import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import ActivityTimeline from "@/components/organisms/ActivityTimeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { dealService } from "@/services/api/dealService";
import { activityService } from "@/services/api/activityService";

const Dashboard = () => {
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [dealsData, activitiesData] = await Promise.all([
        dealService.getAll(),
        activityService.getAll()
      ]);
      
      setDeals(dealsData);
      setActivities(activitiesData.slice(0, 10)); // Show only latest 10 activities
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateStats = () => {
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const wonDeals = deals.filter(deal => deal.stage === "closed-won");
    const totalWonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    const conversionRate = deals.length > 0 ? (wonDeals.length / deals.length * 100).toFixed(1) : 0;
    const avgDealSize = deals.length > 0 ? (totalValue / deals.length) : 0;

    const pipelineByStage = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {});

    return {
      totalValue,
      totalWonValue,
      conversionRate,
      avgDealSize,
      totalDeals: deals.length,
      pipelineByStage
    };
  };

  if (loading) {
    return (
      <div className="p-6">
        <Loading />
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

  if (deals.length === 0) {
    return (
      <div className="p-6">
        <Empty
          title="No deals in your pipeline"
          description="Start by creating your first deal to track your sales progress"
          actionLabel="Create Deal"
          icon="GitBranch"
        />
      </div>
    );
  }

  const stats = calculateStats();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Sales Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Overview of your sales pipeline and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pipeline Value"
          value={formatCurrency(stats.totalValue)}
          icon="DollarSign"
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          title="Won Deals Value"
          value={formatCurrency(stats.totalWonValue)}
          icon="Target"
          trend="up"
          trendValue="+8.2%"
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon="TrendingUp"
          trend="up"
          trendValue="+2.1%"
        />
        <StatCard
          title="Average Deal Size"
          value={formatCurrency(stats.avgDealSize)}
          icon="BarChart3"
          trend="down"
          trendValue="-3.4%"
        />
      </div>

      {/* Pipeline Overview & Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="GitBranch" size={20} className="mr-2 text-primary" />
              Pipeline Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.pipelineByStage).map(([stage, count]) => {
                const stageLabels = {
                  "new": "New Leads",
                  "qualified": "Qualified",
                  "proposal": "Proposal",
                  "negotiation": "Negotiation",
                  "closed-won": "Closed Won",
                  "closed-lost": "Closed Lost"
                };
                
                const stageColors = {
                  "new": "bg-blue-500",
                  "qualified": "bg-purple-500",
                  "proposal": "bg-yellow-500",
                  "negotiation": "bg-orange-500",
                  "closed-won": "bg-green-500",
                  "closed-lost": "bg-red-500"
                };

                const percentage = stats.totalDeals > 0 ? (count / stats.totalDeals * 100) : 0;

                return (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${stageColors[stage]}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {stageLabels[stage]}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${stageColors[stage]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <ActivityTimeline activities={activities} />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ApperIcon name="Zap" size={20} className="mr-2 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group">
              <ApperIcon name="Plus" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Add Deal</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group">
              <ApperIcon name="UserPlus" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Add Contact</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group">
              <ApperIcon name="Phone" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Log Call</span>
            </button>
            <button className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group">
              <ApperIcon name="Calendar" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Schedule Meeting</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;