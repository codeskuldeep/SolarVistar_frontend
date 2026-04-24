import React, { useState } from "react";
import { useDebounce } from "use-debounce";
import { useGetLeadsQuery } from "../../context/api/leadsApi";
import { CheckCircle, FileText } from "lucide-react";
import { ReceiptIcon, UserIcon } from "@phosphor-icons/react";
import Pagination from "../../components/ui/Pagination";
import { useNavigate } from "react-router";
import LeadDocuments from "../../components/LeadDocuments";
import QuotationsDrawer from "../../components/ui/QuotationsDrawer";

export default function ExistingCustomers() {
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounce("", 400);
  const navigate = useNavigate();
  const { data, isLoading } = useGetLeadsQuery({
    page,
    limit: 10,
    search: debouncedSearch,
    status: "CONVERTED",
  });

  const existingCustomersList = data?.leads ?? [];
  const meta = data?.meta ?? { totalPages: 1, currentPage: 1, totalItems: 0 };

  const [quotesCustomer, setQuotesCustomer] = useState(null);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) setPage(newPage);
  };
  const handleDocumentClick = (customerId) => {
    navigate(`/customers/${customerId}/documents`);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Existing Customers
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage installations and documents for converted accounts.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-slate-950/50 border-b border-gray-200 dark:border-slate-800 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Customer Name</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Sales Rep</th>
              <th className="px-6 py-4">Payment Setup</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  Loading customers...
                </td>
              </tr>
            ) : existingCustomersList.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No converted customers yet.
                </td>
              </tr>
            ) : (
              existingCustomersList.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {customer.customerName}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {customer.phoneNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 dark:text-white">
                      {customer.assignedTo?.name || "Unassigned"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                      Pending Setup
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-3">
                      {/* Profile button */}
                      <button
                        onClick={() => navigate(`/customers/${customer.id}/profile`)}
                        title="View Profile"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors text-sm"
                      >
                        <UserIcon size={15} weight="regular" />
                        Profile
                      </button>

                      {/* Quotations drawer button */}
                      <button
                        onClick={() => setQuotesCustomer(customer)}
                        title="View / Add Quotations"
                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 font-medium transition-colors text-sm"
                      >
                        <ReceiptIcon size={15} weight="regular" />
                        Quotes
                      </button>

                      {/* Documents button */}
                      <button
                        onClick={() => handleDocumentClick(customer.id)}
                        className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-1.5" /> Docs
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          meta={meta}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          itemName="customers"
        />
      </div>

      {/* Quotations Drawer */}
      {quotesCustomer && (
        <QuotationsDrawer
          leadId={quotesCustomer.id}
          title={quotesCustomer.customerName}
          subtitle={quotesCustomer.phoneNumber}
          onClose={() => setQuotesCustomer(null)}
        />
      )}
    </div>
  );
}
