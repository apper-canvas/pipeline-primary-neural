import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import invoiceService from '@/services/api/invoiceService';
import ApperIcon from '@/components/ApperIcon';
import InvoiceModal from '@/components/organisms/InvoiceModal';
import SearchBar from '@/components/molecules/SearchBar';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Loading from '@/components/ui/Loading';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('issueDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortInvoices();
  }, [invoices, searchQuery, statusFilter, sortField, sortDirection]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceService.getAll();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to load invoices. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortInvoices = () => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.total?.toString().includes(searchQuery) ||
        invoice.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => 
        invoice.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'issueDate' || sortField === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'total') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (typeof aValue === 'string') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInvoices(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const handleSaveInvoice = async (invoiceData) => {
    try {
      if (selectedInvoice) {
        await invoiceService.update(selectedInvoice.Id, invoiceData);
        toast.success('Invoice updated successfully');
      } else {
        await invoiceService.create(invoiceData);
        toast.success('Invoice created successfully');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error(selectedInvoice ? 'Failed to update invoice' : 'Failed to create invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await invoiceService.delete(invoiceId);
      toast.success('Invoice deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status?.toLowerCase()) {
      case 'paid':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'sent':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'overdue':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ApperIcon name="ArrowUpDown" size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ApperIcon name="ArrowUp" size={14} className="text-primary" />
      : <ApperIcon name="ArrowDown" size={14} className="text-primary" />;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div className="min-h-screen bg-surface-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600 mt-1">Manage and track your invoices</p>
          </div>
          <Button 
            onClick={handleCreateInvoice}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={20} />
            New Invoice
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search invoices, clients, or amounts..."
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card>
          <CardContent className="p-0">
            {filteredInvoices.length === 0 ? (
              <Empty
                icon="Receipt"
                title="No invoices found"
                description={searchQuery || statusFilter !== 'all' 
                  ? "No invoices match your current filters. Try adjusting your search or filter criteria."
                  : "Get started by creating your first invoice."
                }
                action={
                  <Button onClick={handleCreateInvoice} className="mt-4">
                    <ApperIcon name="Plus" size={20} className="mr-2" />
                    Create Invoice
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-900">
                        <button 
                          onClick={() => handleSort('invoiceNumber')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Invoice #
                          {getSortIcon('invoiceNumber')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        <button 
                          onClick={() => handleSort('clientName')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Client
                          {getSortIcon('clientName')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        <button 
                          onClick={() => handleSort('total')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Amount
                          {getSortIcon('total')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        <button 
                          onClick={() => handleSort('issueDate')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Issue Date
                          {getSortIcon('issueDate')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">
                        <button 
                          onClick={() => handleSort('dueDate')}
                          className="flex items-center gap-2 hover:text-primary"
                        >
                          Due Date
                          {getSortIcon('dueDate')}
                        </button>
                      </th>
                      <th className="text-left p-4 font-medium text-gray-900">Status</th>
                      <th className="text-right p-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => (
                      <tr key={invoice.Id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {invoice.clientName}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(invoice.total)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Subtotal: {formatCurrency(invoice.subtotal)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-900">
                            {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-900">
                            {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={getStatusBadgeClass(invoice.status)}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-2 text-gray-400 hover:text-primary rounded-md hover:bg-gray-100 transition-colors"
                              title="Edit"
                            >
                              <ApperIcon name="Edit" size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.Id)}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <ApperIcon name="Trash" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invoice Modal */}
      {showModal && (
        <InvoiceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveInvoice}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}

export default Invoices;