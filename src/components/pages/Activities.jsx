import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { activityService } from "@/services/api/activityService";
import { dealService } from "@/services/api/dealService";
import { format } from "date-fns";

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [deals, setDeals] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [activitiesData, dealsData] = await Promise.all([
        activityService.getAll(),
        dealService.getAll()
      ]);
      
      setActivities(activitiesData);
      setDeals(dealsData);
    } catch (err) {
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...activities];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(activity => activity.type === filterType);
    }

    // Sort by timestamp
    filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredActivities(filtered);
  }, [activities, filterType, sortOrder]);

  const getDealTitle = (dealId) => {
    const deal = deals.find(d => d.Id === parseInt(dealId));
    return deal ? deal.title : `Deal #${dealId}`;
  };

  const getActivityIcon = (type) => {
    const icons = {
      "call": "Phone",
      "email": "Mail",
      "meeting": "Calendar",
      "note": "FileText",
      "task": "CheckCircle"
    };
    return icons[type] || "Activity";
  };

  const getActivityColor = (type) => {
    const colors = {
      "call": "default",
      "email": "success",
      "meeting": "secondary",
      "note": "warning",
      "task": "error"
    };
    return colors[type] || "default";
  };

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "call", label: "Calls" },
    { value: "email", label: "Emails" },
    { value: "meeting", label: "Meetings" },
    { value: "note", label: "Notes" },
    { value: "task", label: "Tasks" }
  ];

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Activities
          </h1>
          <p className="text-gray-600 mt-2">Track all your sales activities and interactions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <ApperIcon name="Filter" size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {activityTypes.map(type => (
                <Button
                  key={type.value}
                  variant={filterType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center space-x-2 ml-auto">
              <span className="text-sm text-gray-600">Sort:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              >
                <ApperIcon 
                  name={sortOrder === "desc" ? "ArrowDown" : "ArrowUp"} 
                  size={14} 
                  className="mr-1" 
                />
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      {activities.length === 0 ? (
        <Empty
          title="No activities logged"
          description="Start tracking your sales activities to see them here"
          actionLabel="Log Activity"
          icon="Activity"
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity, index) => (
            <Card key={activity.Id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "call" ? "bg-blue-100 text-blue-600" :
                    activity.type === "email" ? "bg-green-100 text-green-600" :
                    activity.type === "meeting" ? "bg-purple-100 text-purple-600" :
                    activity.type === "note" ? "bg-yellow-100 text-yellow-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    <ApperIcon name={getActivityIcon(activity.type)} size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getActivityColor(activity.type)}>
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getDealTitle(activity.dealId)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredActivities.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <ApperIcon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
                <p className="text-gray-600">Try changing your filter criteria</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Quick Stats */}
      {activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="BarChart3" size={20} className="mr-2 text-primary" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {activityTypes.slice(1).map(type => {
                const count = activities.filter(a => a.type === type.value).length;
                return (
                  <div key={type.value} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{type.label}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Activities;