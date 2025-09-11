import { toast } from 'react-toastify';
import invoiceData from '@/services/mockData/invoices.json';

// Helper function to simulate API delay
async function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class InvoiceService {
  constructor() {
    this.data = [...invoiceData];
    this.nextId = Math.max(...this.data.map(item => item.Id)) + 1;
  }

  // Get all invoices
  async getAll() {
    await delay();
    return [...this.data];
  }

  // Get invoice by ID
  async getById(id) {
    await delay();
    const invoice = this.data.find(item => item.Id === parseInt(id));
    return invoice ? { ...invoice } : null;
  }

  // Create new invoice
  async create(invoiceData) {
    await delay();
    
    // Generate invoice number
    const currentYear = new Date().getFullYear();
    const invoiceCount = this.data.filter(inv => 
      inv.invoiceNumber.includes(currentYear.toString())
    ).length + 1;
    
    const newInvoice = {
      ...invoiceData,
      Id: this.nextId++,
      invoiceNumber: `INV-${currentYear}-${invoiceCount.toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      // Ensure line items have IDs
      lineItems: invoiceData.lineItems?.map((item, index) => ({
        ...item,
        id: item.id || index + 1
      })) || []
    };
    
    this.data.push(newInvoice);
    return { ...newInvoice };
  }

  // Update existing invoice
  async update(id, invoiceData) {
    await delay();
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    
    // Ensure line items have IDs
    const updatedInvoice = {
      ...this.data[index],
      ...invoiceData,
      Id: parseInt(id),
      lineItems: invoiceData.lineItems?.map((item, idx) => ({
        ...item,
        id: item.id || idx + 1
      })) || []
    };
    
    this.data[index] = updatedInvoice;
    return { ...updatedInvoice };
  }

  // Delete invoice
  async delete(id) {
    await delay();
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    
    this.data.splice(index, 1);
    return true;
  }

  // Calculate invoice totals
  calculateTotals(lineItems, taxRate = 0) {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
    
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  }
}

// Create and export service instance
const invoiceService = new InvoiceService();
export default invoiceService;