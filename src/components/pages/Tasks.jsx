import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { contactService } from "@/services/api/contactService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import TaskModal from "@/components/organisms/TaskModal";
import taskService from "@/services/api/taskService";
const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [contactFilter, setContactFilter] = useState('');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
const [sortBy, setSortBy] = useState('CreatedOn');
  const [sortOrder, setSortOrder] = useState('desc');
  const [assignedFilter, setAssignedFilter] = useState('');

  // Status and Priority options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'New', label: 'New' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Canceled', label: 'Canceled' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priority' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];

  // Load data
  useEffect(() => {
    loadData();
}, [statusFilter, priorityFilter, contactFilter, assignedFilter]);
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load tasks with filters
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
if (contactFilter) filters.contactId = contactFilter;
      if (assignedFilter) filters.contactId = assignedFilter;
      const [tasksData, contactsData] = await Promise.all([
        taskService.getAll(filters),
        contactService.getAll()
      ]);
      
      setTasks(tasksData || []);
      setContacts(contactsData || []);
    } catch (err) {
      console.error('Error loading task data:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
.filter(task => 
      !searchTerm || 
      task.subject_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getContactName(task.contactId_c)?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'dueDate_c' || sortBy === 'CreatedOn') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

  // Status styling
  const getStatusBadge = (status) => {
    const variants = {
      'New': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'On Hold': 'bg-orange-100 text-orange-800',
      'Canceled': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${variants[status] || 'bg-gray-100 text-gray-800'} px-2 py-1 text-xs`}>
        {status || 'Unknown'}
      </Badge>
    );
  };

  // Priority styling
  const getPriorityBadge = (priority) => {
    const variants = {
      'High': 'bg-red-100 text-red-800 border-red-200',
      'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Low': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <Badge className={`${variants[priority] || 'bg-gray-100 text-gray-800'} px-2 py-1 text-xs border`}>
        {priority || 'None'}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Check if task is overdue
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Completed') return false;
    return new Date(dueDate) < new Date();
  };

  // Get contact name
  const getContactName = (contactId) => {
    if (!contactId) return 'Unassigned';
    const contact = contacts.find(c => c.Id === contactId?.Id || c.Id === contactId);
    return contact?.Name || 'Unknown Contact';
  };

  // Handle task actions
  const handleNewTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const success = await taskService.delete(taskId);
    if (success) {
      await loadData();
    }
  };

  const handleTaskSave = async (taskData) => {
    const success = selectedTask 
      ? await taskService.update(selectedTask.Id, taskData)
      : await taskService.create(taskData);
      
    if (success) {
      setIsTaskModalOpen(false);
      setSelectedTask(null);
      await loadData();
    }
  };

  const handleMarkComplete = async (task) => {
    const updatedTask = {
      ...task,
      status: 'Completed',
      completedDate: new Date().toISOString()
    };
    
    const success = await taskService.update(task.Id, updatedTask);
    if (success) {
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        </div>
        <Error message={error} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage and track your tasks</p>
        </div>
        <Button 
          onClick={handleNewTask}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={16} />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
            />
          </div>
          <div>
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={priorityOptions}
            />
          </div>
          <div>
            <Select
              value={contactFilter}
              onChange={setContactFilter}
              options={[
                { value: '', label: 'All Contacts' },
                ...contacts.map(contact => ({
                  value: contact.Id.toString(),
                  label: contact.Name
                }))
              ]}
            />
          </div>
          <div>
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              options={[
                { value: 'CreatedOn-desc', label: 'Newest First' },
                { value: 'CreatedOn-asc', label: 'Oldest First' },
                { value: 'dueDate_c-asc', label: 'Due Date (Soon)' },
                { value: 'dueDate_c-desc', label: 'Due Date (Later)' },
                { value: 'priority_c-desc', label: 'Priority (High)' },
                { value: 'subject_c-asc', label: 'Subject (A-Z)' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty 
          icon="CheckSquare"
          title="No tasks found"
          description="Create your first task to get started with task management."
        />
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.Id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {task.subject_c || 'Untitled Task'}
</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(task.status_c)}
                          {getPriorityBadge(task.priority_c)}
                          {task.isRecurring_c && (
                            <Badge variant="secondary" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                          {task.reminderSet_c && (
                            <Badge variant="outline" className="text-xs">
                              <ApperIcon name="Bell" size={10} className="mr-1" />
                              Reminder
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Contact Assignment - Prominent Display */}
                      <div className="flex items-center gap-1 text-sm text-gray-700 font-medium mb-2">
                        <ApperIcon name="User" size={14} />
                        <span>Contact: {getContactName(task.contactId_c)}</span>
                      </div>
                      
                      {task.description_c && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {task.description_c}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-500">
                        <div className="space-y-1">
                          {task.category_c && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <ApperIcon name="Tag" size={12} />
                              <span>{task.category_c}</span>
                            </div>
                          )}
                          {task.recurrencePattern_c && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <ApperIcon name="Repeat" size={12} />
                              <span>{task.recurrencePattern_c}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Calendar" size={14} />
                          <span 
                            className={`${
                              isOverdue(task.dueDate_c, task.status_c) 
                                ? 'text-red-600 font-medium' 
                                : ''
                            }`}
                          >
                            Due: {formatDate(task.dueDate_c)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <ApperIcon name="Clock" size={14} />
                          <span>Created: {formatDate(task.CreatedOn)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  {task.status_c !== 'Completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkComplete(task)}
                      className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                    >
                      <ApperIcon name="Check" size={14} />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTask(task.Id)}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleTaskSave}
        contacts={contacts}
      />
    </div>
  );
};

export default Tasks;