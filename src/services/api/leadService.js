import mockData from '@/services/mockData/leads.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let leads = [...mockData];
let nextId = Math.max(...leads.map(lead => lead.Id)) + 1;

export const leadService = {
  async getAll() {
    await delay(300);
    return [...leads];
  },

  async getById(id) {
    await delay(250);
    const leadId = parseInt(id);
    if (isNaN(leadId) || leadId <= 0) {
      throw new Error('Invalid lead ID');
    }
    
    const lead = leads.find(l => l.Id === leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    return { ...lead };
  },

  async create(leadData) {
    await delay(400);
    
    if (!leadData.name || !leadData.email) {
      throw new Error('Name and email are required');
    }

    const newLead = {
      Id: nextId++,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || '',
      company: leadData.company || '',
      status: leadData.status || 'new',
      source: leadData.source || 'manual',
      priority: leadData.priority || 'medium',
      notes: leadData.notes || '',
      assignedTo: leadData.assignedTo || 'Unassigned',
      createdAt: new Date().toISOString()
    };

    leads.push(newLead);
    return { ...newLead };
  },

  async update(id, leadData) {
    await delay(350);
    
    const leadId = parseInt(id);
    if (isNaN(leadId) || leadId <= 0) {
      throw new Error('Invalid lead ID');
    }

    const index = leads.findIndex(l => l.Id === leadId);
    if (index === -1) {
      throw new Error('Lead not found');
    }

    if (!leadData.name || !leadData.email) {
      throw new Error('Name and email are required');
    }

    const updatedLead = {
      ...leads[index],
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || '',
      company: leadData.company || '',
      status: leadData.status || 'new',
      source: leadData.source || 'manual',
      priority: leadData.priority || 'medium',
      notes: leadData.notes || '',
      assignedTo: leadData.assignedTo || 'Unassigned'
    };

    leads[index] = updatedLead;
    return { ...updatedLead };
  },

  async delete(id) {
    await delay(300);
    
    const leadId = parseInt(id);
    if (isNaN(leadId) || leadId <= 0) {
      throw new Error('Invalid lead ID');
    }

    const index = leads.findIndex(l => l.Id === leadId);
    if (index === -1) {
      throw new Error('Lead not found');
    }

    const deletedLead = leads[index];
    leads.splice(index, 1);
    return { ...deletedLead };
  },

  async search(query) {
    await delay(200);
    
    if (!query || query.trim() === '') {
      return [...leads];
    }

    const searchTerm = query.toLowerCase();
    return leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.company.toLowerCase().includes(searchTerm) ||
      lead.phone.includes(searchTerm)
    );
  },

  async getByStatus(status) {
    await delay(250);
    return leads.filter(lead => lead.status === status);
  },

  async getByPriority(priority) {
    await delay(250);
    return leads.filter(lead => lead.priority === priority);
  }
};

export default leadService;