import React, { useState } from "react";
import EmailFollowUpModal from "@/components/organisms/EmailFollowUpModal";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import Activities from "@/components/pages/Activities";

const ActivityTimeline = ({ activities, className, onFollowUpScheduled }) => {
  const [emailFollowUpModal, setEmailFollowUpModal] = useState({ isOpen: false, dealId: null });

  const getActivityIcon = (type) => {
    const icons = {
      "call": "Phone",
      "email": "Mail",
      "meeting": "Calendar",
      "note": "FileText",
      "task": "CheckCircle",
      "email_followup": "Send"
    };
    return icons[type] || "Activity";
  };

const getActivityColor = (type) => {
    const colors = {
      "call": "text-blue-600 bg-blue-100",
      "email": "text-green-600 bg-green-100",
      "meeting": "text-purple-600 bg-purple-100",
      "note": "text-yellow-600 bg-yellow-100",
      "task": "text-red-600 bg-red-100",
      "email_followup": "text-indigo-600 bg-indigo-100"
    };
    return colors[type] || "text-gray-600 bg-gray-100";
  };

  const handleScheduleFollowUp = (dealId) => {
    setEmailFollowUpModal({ isOpen: true, dealId });
  };

  const handleFollowUpScheduled = () => {
    onFollowUpScheduled?.();
    toast.success("Email follow-up scheduled successfully");
  };

  if (!activities || activities.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <ApperIcon name="Activity" size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Yet</h3>
          <p className="text-gray-600">Activities will appear here as they are logged</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.Id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
<div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.type)}`}>
                        <ApperIcon name={getActivityIcon(activity.type)} size={16} />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {activity.description}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {(activity.type === "call" || activity.type === "meeting") && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleScheduleFollowUp(activity.dealId)}
                              className="text-xs"
                            >
                              <ApperIcon name="Send" size={12} className="mr-1" />
                              Schedule Email Follow-up
                            </Button>
                          </div>
                        )}
                      </div>
</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>

      <EmailFollowUpModal
        isOpen={emailFollowUpModal.isOpen}
        onClose={() => setEmailFollowUpModal({ isOpen: false, dealId: null })}
        dealId={emailFollowUpModal.dealId}
        onFollowUpScheduled={handleFollowUpScheduled}
      />
    </Card>
  );
};
export default ActivityTimeline;