import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExistingCustomers } from "../../context/slices/leadSlice";
import { CheckCircle, FileText } from "lucide-react";

export default function ExistingCustomers() {
  const dispatch = useDispatch();
  // Pull from whatever state you saved the converted leads into
  const { existingCustomersList, isLoading, meta } = useSelector(
    (state) => state.leads,
  );

  useEffect(() => {
    dispatch(fetchExistingCustomers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta?.totalPages) {
      dispatch(
        fetchExistingCustomers({ page: newPage, limit: meta.itemsPerPage }),
      );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Existing Customers
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage installations and documents for converted accounts.
        </p>
      </div>

      {/* Table */}
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
            ) : existingCustomersList?.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-400">
                  No converted customers yet.
                </td>
              </tr>
            ) : (
              existingCustomersList?.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
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
                    {/* Placeholder for the Payment Method we will add next */}
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-medium">
                      Pending Setup
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
                      <FileText className="w-4 h-4 mr-1.5" /> Docs
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Drop in your Pagination Footer here! */}
      </div>
    </div>
  );
}
