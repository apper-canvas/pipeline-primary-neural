import mockActivities from "@/services/mockData/activities.json";

class ActivityService {

async getAll(userId = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // If no userId provided, return all activities
    if (!userId) {
      return [...this.activities];
    }
    
    // Filter activities based on user permissions
    const { userService } = await import('@/services/api/userService');
    const currentUser = await userService.getCurrentUser();
    
    if (!currentUser) {
      return [];
    }
    
    // Managers and admins can see all activities
    if (currentUser.permissions.includes('view_all_deals')) {
      return [...this.activities];
    }
    
    // Regular users see activities related to their deals
    const userDealIds = this.getUserDealIds(currentUser.Id);
    const filteredActivities = this.activities.filter(activity => 
      userDealIds.includes(parseInt(activity.dealId))
    );
    
    return [...filteredActivities];
  }

  getUserDealIds(userId) {
    // Demo logic: match the deal filtering logic
    if (userId === 1) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Manager sees all
    if (userId === 2) return [1, 2, 4, 7, 9]; // Sales rep sees subset
    if (userId === 3) return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Admin sees all
    return [1, 2, 3]; // Default fallback
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 150));
    const activity = this.activities.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error("Activity not found");
    }
    return { ...activity };
  }

async create(activityData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newActivity = {
      ...activityData,
      Id: Math.max(...this.activities.map(a => a.Id), 0) + 1,
      timestamp: new Date().toISOString(),
      // Support for detailed call log fields
      callType: activityData.callType || null,
      followUpStatus: activityData.followUpStatus || null,
      followUpDate: activityData.followUpDate || null,
      notes: activityData.notes || null,
      // Support for meeting scheduler fields
      title: activityData.title || null,
      participants: activityData.participants || [],
      location: activityData.location || null,
      agenda: activityData.agenda || null,
      duration: activityData.duration || null,
      meetingType: activityData.meetingType || null,
      calendarEventId: activityData.calendarEventId || null,
      invitationsSent: activityData.invitationsSent || false,
      // Support for email follow-up fields
      emailFollowUpId: activityData.emailFollowUpId || null,
      followUpPriority: activityData.followUpPriority || null,
      followUpTemplate: activityData.followUpTemplate || null
    };
    
    this.activities.push(newActivity);
    return { ...newActivity };
  }

  async update(id, activityData) {
    await new Promise(resolve => setTimeout(resolve, 250));
    
    const index = this.activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Activity not found");
    }
    
    const updatedActivity = {
      ...this.activities[index],
      ...activityData,
      Id: parseInt(id)
    };
    
    this.activities[index] = updatedActivity;
    return { ...updatedActivity };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Activity not found");
    }
this.activities.splice(index, 1);
    return true;
  }

  // Email Follow-up Management
  constructor() {
    this.activities = [...mockActivities];
    this.emailFollowUps = []; // Store email follow-ups separately
  }

  async createEmailFollowUp(followUpData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newFollowUp = {
      ...followUpData,
      Id: Math.max(...this.emailFollowUps.map(f => f.Id), 0) + 1,
      createdDate: new Date().toISOString(),
      status: followUpData.status || "scheduled"
    };
    
    this.emailFollowUps.push(newFollowUp);
    
    // Create activity record for the follow-up
    const activityData = {
      type: "email_followup",
      dealId: followUpData.dealId,
      description: `Email follow-up scheduled: ${followUpData.subject}`,
      emailFollowUpId: newFollowUp.Id,
      followUpPriority: followUpData.priority,
      followUpTemplate: followUpData.template
    };
    
    await this.create(activityData);
    return { ...newFollowUp };
  }

  async getFollowUpsByDeal(dealId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const followUps = this.emailFollowUps.filter(f => f.dealId === parseInt(dealId));
    
    // Update overdue status
    const now = new Date();
    followUps.forEach(followUp => {
      if (followUp.status === "scheduled" && new Date(followUp.scheduledDate) < now) {
        followUp.status = "overdue";
      }
    });
    
    return followUps.sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
  }

  async updateFollowUpStatus(followUpId, status) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const followUp = this.emailFollowUps.find(f => f.Id === parseInt(followUpId));
    if (!followUp) {
      throw new Error("Follow-up not found");
    }
    
    followUp.status = status;
    
    if (status === "sent") {
      // Create activity record when follow-up is sent
      const activityData = {
        type: "email",
        dealId: followUp.dealId,
        description: `Email follow-up sent: ${followUp.subject}`,
        emailFollowUpId: followUp.Id
      };
      
      await this.create(activityData);
    }
    
    return { ...followUp };
  }

  async getAllFollowUps() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update overdue status
    const now = new Date();
    this.emailFollowUps.forEach(followUp => {
      if (followUp.status === "scheduled" && new Date(followUp.scheduledDate) < now) {
        followUp.status = "overdue";
      }
    });
    
    return [...this.emailFollowUps];
  }

  async getOverdueFollowUps() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const now = new Date();
    const overdueFollowUps = this.emailFollowUps.filter(followUp => 
      followUp.status === "scheduled" && new Date(followUp.scheduledDate) < now
    );
    
    // Update their status to overdue
    overdueFollowUps.forEach(followUp => {
      followUp.status = "overdue";
    });
    
    return overdueFollowUps;
  }

  async deleteFollowUp(followUpId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = this.emailFollowUps.findIndex(f => f.Id === parseInt(followUpId));
if (index === -1) {
      throw new Error("Follow-up not found");
    }
    
    this.emailFollowUps.splice(index, 1);
    return true;
  }
}

// Create and export service instance
const activityService = new ActivityService();
export default activityService;