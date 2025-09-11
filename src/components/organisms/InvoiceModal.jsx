import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Label from '@/components/atoms/Label';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';
import invoiceService from '@/services/api/invoiceService';

const InvoiceModal = ({ isOpen, onClose, onSave, invoice }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    contactId: '',
    companyId: '',
    issueDate: '',
    dueDate: '',
    status: 'Draft',
    subtotal: 0,
    taxRate: 8,
    taxAmount: 0,
    total: 0,
    notes: '',
    lineItems: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        issueDate: invoice.issueDate ? invoice.issueDate.split('T')[0] : '',
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        lineItems: invoice.lineItems || []
      });
    } else {
      // Set default dates for new invoice
      const today = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      
      setFormData({
        clientName: '',
        contactId: '',
        companyId: '',
        issueDate: today,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'Draft',
        subtotal: 0,
        taxRate: 8,
        taxAmount: 0,
        total: 0,
        notes: 'Thank you for your business. Payment terms: Net 30 days.',
        lineItems: [{
          id: 1,
          description: '',
          quantity: 1,
          price: 0,
          total: 0
        }]
      });
    }
  }, [invoice]);

  useEffect(() => {
    calculateTotals();
  }, [formData.lineItems, formData.taxRate]);

  const calculateTotals = () => {
    const subtotal = formData.lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
    }, 0);

    const taxAmount = subtotal * (parseFloat(formData.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value
    };

    // Calculate line item total
    if (field === 'quantity' || field === 'price') {
      const quantity = parseFloat(newLineItems[index].quantity || 0);
      const price = parseFloat(newLineItems[index].price || 0);
      newLineItems[index].total = parseFloat((quantity * price).toFixed(2));
    }

    setFormData(prev => ({
      ...prev,
      lineItems: newLineItems
    }));
  };

  const addLineItem = () => {
    const newId = Math.max(...formData.lineItems.map(item => item.id || 0)) + 1;
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: newId,
          description: '',
          quantity: 1,
          price: 0,
          total: 0
        }
      ]
    }));
  };

  const removeLineItem = (index) => {
    if (formData.lineItems.length === 1) {
      toast.warning('At least one line item is required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (new Date(formData.dueDate) <= new Date(formData.issueDate)) {
      newErrors.dueDate = 'Due date must be after issue date';
    }

    if (formData.lineItems.length === 0) {
      newErrors.lineItems = 'At least one line item is required';
    }

    const hasEmptyLineItems = formData.lineItems.some(item => 
      !item.description.trim() || parseFloat(item.quantity || 0) <= 0 || parseFloat(item.price || 0) < 0
    );

    if (hasEmptyLineItems) {
      newErrors.lineItems = 'All line items must have description, quantity > 0, and price ≥ 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        ...formData,
        contactId: parseInt(formData.contactId) || null,
        companyId: parseInt(formData.companyId) || null
      };
      
      await onSave(invoiceData);
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={invoice ? 'Edit Invoice' : 'New Invoice'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              error={errors.clientName}
              placeholder="Enter client name"
            />
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="issueDate">Issue Date *</Label>
            <Input
              id="issueDate"
              name="issueDate"
              type="date"
              value={formData.issueDate}
              onChange={handleInputChange}
              error={errors.issueDate}
            />
          </div>
          
          <div>
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleInputChange}
              error={errors.dueDate}
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label>Line Items *</Label>
            <Button
              type="button"
              variant="outline"
              onClick={addLineItem}
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Item
            </Button>
          </div>

          {errors.lineItems && (
            <p className="text-red-500 text-sm mb-2">{errors.lineItems}</p>
          )}

          <div className="space-y-3">
            {formData.lineItems.map((item, index) => (
              <div key={item.id || index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-gray-50">
                <div className="col-span-12 md:col-span-5">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                
                <div className="col-span-4 md:col-span-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                    min="0"
                    step="1"
                  />
                </div>
                
                <div className="col-span-4 md:col-span-2">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleLineItemChange(index, 'price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="col-span-3 md:col-span-2">
                  <Label className="text-xs">Total</Label>
                  <div className="text-sm font-medium py-2">
                    {formatCurrency(item.total)}
                  </div>
                </div>
                
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeLineItem(index)}
                    className="p-2"
                    disabled={formData.lineItems.length === 1}
                  >
                    <ApperIcon name="Trash" size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tax and Totals */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md ml-auto">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label>Subtotal</Label>
              <div className="py-2 font-medium">{formatCurrency(formData.subtotal)}</div>
            </div>
            <div>
              <Label>Tax Amount</Label>
              <div className="py-2 font-medium">{formatCurrency(formData.taxAmount)}</div>
            </div>
          </div>
          <div className="text-right mt-2">
            <div className="text-lg font-bold">
              Total: {formatCurrency(formData.total)}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary resize-none"
            placeholder="Invoice terms, payment instructions, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Save" size={16} />
            {invoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default InvoiceModal;