import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import ApperIcon from "@/components/ApperIcon";
import DealModal from "@/components/organisms/DealModal";
import CallLogModal from "@/components/organisms/CallLogModal";
import ActivityTimeline from "@/components/organisms/ActivityTimeline";
import MeetingSchedulerModal from "@/components/organisms/MeetingSchedulerModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Pipeline from "@/components/pages/Pipeline";
import StatCard from "@/components/molecules/StatCard";
import dealsData from "@/services/mockData/deals.json";
import leadsData from "@/services/mockData/leads.json";
import contactsData from "@/services/mockData/contacts.json";
import activitiesData from "@/services/mockData/activities.json";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import { dealService } from "@/services/api/dealService";
import { taskService } from "@/services/api/taskService";
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  
  const canViewAllDeals = () => {
    return user?.role === 'admin' || user?.role === 'manager';
  };
const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCallLogModalOpen, setIsCallLogModalOpen] = useState(false);
  const [isMeetingSchedulerModalOpen, setIsMeetingSchedulerModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
if (!user) {
        setError("User not authenticated");
        return;
      }
      
const [dealsData, activitiesData, contactsData] = await Promise.all([
        dealService.getAll(),
        activityService.getAll(),
        contactService.getAll()
      ]);
      
      setDeals(dealsData);
      setActivities(activitiesData.slice(0, 10)); // Show only latest 10 activities
      setContacts(contactsData);
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

const handleDealSave = async (dealData) => {
    try {
      const newDeal = await dealService.create(dealData);
      if (newDeal) {
        // Refresh dashboard data after successful deal creation
        loadData();
        setIsDealModalOpen(false);
        toast.success('Deal created successfully!');
      }
    } catch (error) {
      console.error('Error creating deal:', error);
      toast.error('Failed to create deal. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
{user?.firstName ? `Welcome back, ${user.firstName}!` : 'Sales Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {canViewAllDeals() 
              ? 'Overview of team sales pipeline and performance' 
              : 'Your personal sales pipeline and performance'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
<p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.emailAddress}</p>
          </div>
{user?.profilePicture && (
            <img 
              src={user.profilePicture} 
              alt={user.firstName}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
            />
          )}
        </div>
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
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
<button 
              onClick={() => setIsDealModalOpen(true)}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group min-h-[100px] justify-center"
            >
              <ApperIcon name="Plus" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">Add Deal</span>
            </button>
            <button 
              onClick={() => {
                navigate('/contacts');
                toast.success('Redirecting to Contacts to add new contact');
              }}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group min-h-[100px] justify-center"
            >
              <ApperIcon name="UserPlus" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">Add Contact</span>
            </button>
            <button 
              onClick={() => {
                navigate('/tasks');
                toast.success('Redirecting to Tasks to create new task');
              }}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group min-h-[100px] justify-center"
            >
              <ApperIcon name="CheckSquare" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">Add Task</span>
            </button>
            <button 
              onClick={() => setIsCallLogModalOpen(true)}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group min-h-[100px] justify-center"
            >
              <ApperIcon name="Phone" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">Log Call</span>
            </button>
<button 
              onClick={() => setIsMeetingSchedulerModalOpen(true)}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border-2 border-dashed border-primary/20 hover:border-primary/40 transition-all duration-200 group min-h-[100px] justify-center"
            >
              <ApperIcon name="Calendar" size={24} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700 text-center">Schedule Meeting</span>
            </button>
            {canViewAllDeals() && (
              <>
<button 
                  onClick={() => {
                    navigate('/activities');
                    toast.info('Viewing team activity reports');
                  }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border-2 border-dashed border-accent/20 hover:border-accent/40 transition-all duration-200 group min-h-[100px] justify-center"
                >
                  <ApperIcon name="BarChart3" size={24} className="text-accent mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 text-center">Team Report</span>
                </button>
<button 
                  onClick={() => {
                    toast.info('Team management features coming soon. Use contacts page to manage team members.');
                  }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg border-2 border-dashed border-secondary/20 hover:border-secondary/40 transition-all duration-200 group min-h-[100px] justify-center"
                >
                  <ApperIcon name="Users" size={24} className="text-secondary mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 text-center">Manage Team</span>
                </button>
<button 
                  onClick={() => {
                    toast.info('Dashboard settings panel coming soon. Current view optimized for your role.');
                  }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-warning/10 to-primary/10 rounded-lg border-2 border-dashed border-warning/20 hover:border-warning/40 transition-all duration-200 group min-h-[100px] justify-center"
                >
                  <ApperIcon name="Settings" size={24} className="text-warning mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-700 text-center">Dashboard Settings</span>
                </button>
<button 
                  onClick={() => {
                    toast.success('Export feature ready! Visit pipeline or contacts pages to export specific data sets.');
                  }}
                  className="flex flex-col items-center p-4 bg-gradient-to-br from-info/10 to-primary/10 rounded-lg border-2 border-dashed border-info/20 hover:border-info/40 transition-all duration-200 group min-h-[100px] justify-center"
                >
                  <ApperIcon name="Download" size={24} className="text-info mb-2 group-hover:scale-110 transition-transform" />
<span className="text-sm font-medium text-gray-700 text-center">Export Data</span>
</button>
<button 
  onClick={() => {
    navigate('/invoices');
  }}
  className="flex flex-col items-center p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border-2 border-dashed border-accent/20 hover:border-accent/40 transition-all duration-200 group min-h-[100px] justify-center"
>
  <ApperIcon name="Receipt" size={24} className="text-accent mb-2 group-hover:scale-110 transition-transform" />
  <span className="text-sm font-medium text-gray-700 text-center">Create Invoice</span>
</button>
</>
)}
</div>
</CardContent>
      </Card>

{/* Call Log Modal */}
      <CallLogModal
        isOpen={isCallLogModalOpen}
        onClose={() => setIsCallLogModalOpen(false)}
        onSuccess={loadData}
        userId={user?.userId}
      />

      {/* Meeting Scheduler Modal */}
      <MeetingSchedulerModal
        isOpen={isMeetingSchedulerModalOpen}
        onClose={() => setIsMeetingSchedulerModalOpen(false)}
        onSuccess={loadData}
        userId={user?.userId}
/>

      {/* Deal Modal */}
      <DealModal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        onSave={handleDealSave}
        contacts={contacts}
      />
    </div>
  );
};

export default Dashboard;