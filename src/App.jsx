import { useState, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  DollarSignIcon,
  X,
  MoreVertical,
  Trash,
  Edit,
  Eye,
} from "lucide-react";
import expenseService from "./services/expenseService";

const ExpensesComponent = () => {
  const [expensesData, setExpensesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchExpenses, setSearchExpenses] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    date: "",
  });

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const response = await expenseService.getExpenses();
      const sortedData = response.data.reverse();
      setExpensesData(sortedData);
    } catch (error) {
      setError(error.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedExpense) {
        await expenseService.updateExpense(selectedExpense.expenseId, formData);
      } else {
        await expenseService.createExpense(formData);
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setFormData({ description: "", amount: "", date: "" });
      setSelectedExpense(null);
      await fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      setError(`Failed to ${isEditMode ? "update" : "create"} expense`);
    }
  };

  // Handle context menu action
  const handleContextMenuAction = async (action) => {
    try {
      console.log("Action:", action);
      switch (action) {
        case "delete":
          await expenseService.deleteExpense(selectedExpense.expenseId);
          break;
        case "edit":
          setIsModalOpen(true);
          setIsEditMode(true);
          setFormData({
            description: selectedExpense.description,
            amount: selectedExpense.amount,
            date: selectedExpense.date.split("T")[0],
          });
          await expenseService.updateExpense(
            selectedExpense.expenseId,
            formData
          );
          break;
        case "details":
          setIsDetailsModalOpen(true);
          break;
        default:
          break;
      }
      await fetchExpenses();
    } catch (error) {
      console.error(`Failed to ${action} expense`, error);
      setError(`Failed to ${action} expense`);
    } finally {
      setIsContextMenuOpen(false);
    }
  };

  // Filter expenses
  const filteredExpenses = expensesData.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchExpenses.toLowerCase());

    const expenseDate = new Date(expense.date);
    // console.log(expenseDate);
    const now = new Date();
    // console.log(now);

    switch (filterOption) {
      case "month":
        return (
          matchesSearch &&
          expenseDate.getMonth() === now.getMonth() && // Checks/compare if expense occurred in the same calendar month
          expenseDate.getFullYear() === now.getFullYear() // Checks/compare if expense occurred in the same calendar year
        );

      case "year":
        return matchesSearch && expenseDate.getFullYear() === now.getFullYear(); // Same year

      default: // All
        return matchesSearch;
    }
  });

  // total, highest, and average expense
  const totalExpense = expensesData.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  // console.log(totalExpense);
  const highestExpense = expensesData.reduce(
    (max, expense) => Math.max(max, expense.amount),
    0
  );
  // console.log(highestExpense);
  const averageExpense =
    expensesData.length > 0 ? totalExpense / expensesData.length : 0;
  // console.log(averageExpense);

  // Pagination Calculations
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  // console.log(totalPages);
  const indexOfLastExpense = currentPage * itemsPerPage;
  // console.log(indexOfLastExpense);
  const indexOfFirstExpense = indexOfLastExpense - itemsPerPage;
  // console.log(indexOfFirstExpense);
  const currentExpenses = filteredExpenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  ); // console.log(currentExpenses);

  // Page change handler
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  // Reset page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchExpenses, filterOption]);

  // Page range
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  // Adjust if near start/end
  if (currentPage <= 3) endPage = Math.min(5, totalPages);
  if (currentPage >= totalPages - 2) startPage = Math.max(totalPages - 4, 1);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white min-h-screen">
      <h1 className="text-3xl mb-6">Expense Dashboard</h1>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Overview</h2>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setFormData({ description: "", amount: "", date: "" });
          }}
          className="text-[12px] sm:text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-purple-700 to-blue-700 px-2 py-1 sm:px-4 sm:py-2 rounded-lg"
        >
          <Plus size={16} />
          New Expense
        </button>
      </div>

      {/* Modal section */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 ">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Expense" : "Add New Expense"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  // setSelectedExpense(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Amount($)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  // step="100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditMode ? "Update Expense" : "Create Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overview Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
        <OverviewCard
          title="Total Expenses"
          amount={`${totalExpense.toFixed(2)}`}
          description="+2.5% from last month"
          iconBgColor="bg-blue-700"
          icon={DollarSignIcon}
        />
        <OverviewCard
          title="Average Expense"
          amount={`${averageExpense.toFixed(2)}`}
          description="Per transaction"
          iconBgColor="bg-green-700"
          icon={DollarSignIcon}
        />
        <OverviewCard
          title="Highest Expense"
          amount={`${highestExpense.toFixed(2)}`}
          description="Largest single expense"
          iconBgColor="bg-purple-700"
          icon={DollarSignIcon}
        />
      </div>

      {/* Expense Table */}
      <div className="px-6 py-8 rounded-lg border border-gray-700">
        {/* search and filter section */}
        <div className="flex flex-col sm:flex-row items-start mb-6 gap-3">
          <div className="w-full flex-1">
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchExpenses}
              onChange={(e) => setSearchExpenses(e.target.value)}
              className="bg-gray-700 w-full p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>
          <div className="relative w-full sm:w-1/4">
            <select
              className="w-full appearance-none bg-gray-700 px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
            >
              <option value="all">All</option>
              <option value="month">Filter By Month</option>
              <option value="year">Filter By Year</option>
            </select>
            <ChevronDown
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={16}
            />
          </div>
        </div>
        {loading ? (
          <p>Loading Expenses...</p>
        ) : error ? (
          <p className="text-red-400">Error: {error}</p>
        ) : (
          <table className="w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider">
                  Description
                </th>
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Amount($)
                </th>
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 text-left text-xs font-medium uppercase tracking-wider">
                  More
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentExpenses.map((expense) => (
                <ExpenseTable
                  key={expense.expenseId}
                  expense={expense}
                  onMoreClick={() => {
                    setSelectedExpense(expense);
                    setIsContextMenuOpen(true);
                  }}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context Menu Section */}
      {isContextMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900 flex items-center justify-center"
          onClick={() => setIsContextMenuOpen(false)}
        >
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <button
              onClick={() => handleContextMenuAction("details")}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 rounded-lg"
            >
              <Eye size={16} /> Show Details
            </button>
            <button
              onClick={() => handleContextMenuAction("edit")}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-700 rounded-lg"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={() => handleContextMenuAction("delete")}
              className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-700 rounded-lg"
            >
              <Trash size={16} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Expense Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <p>
                <strong>Description: </strong>
                {selectedExpense.description}
              </p>
              <p>
                <strong>Amount: </strong>
                {selectedExpense.amount}
              </p>
              <p>
                <strong>Date: </strong>
                {new Date(selectedExpense.date).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-sm sm:text-base px-3 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600"
        >
          Previous
        </button>

        {Array.from(
          { length: endPage - startPage + 1 },
          (_, i) => startPage + i
        ).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`text-sm sm:text-base px-3 py-1 rounded-lg ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-sm sm:text-base px-3 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExpensesComponent;

export const OverviewCard = ({
  title,
  amount,
  description,
  iconBgColor,
  icon: Icon,
}) => {
  return (
    <div className="relative p-4 sm:p-6 bg-gray-800/50 border border-gray-700 rounded-lg">
      <h2 className="text-gray-400 mb-4">{title}</h2>
      <div
        className={`${iconBgColor} rounded-full absolute top-6 right-6 w-8 h-8 flex items-center justify-center`}
      >
        {Icon && <Icon size={18} />}
      </div>
      <p className="text-xl sm:text-3xl font-semibold mb-2">${amount}</p>
      <p className="text-sm text-green-500 mb-6">{description}</p>
    </div>
  );
};

const ExpenseTable = ({ expense, onMoreClick }) => {
  return (
    <tr>
      <td className="py-4 text-xs sm:text-sm">{expense.description}</td>
      <td className="py-4 text-xs sm:text-sm">{expense.amount}</td>
      <td className="py-4 text-xs sm:text-sm">
        {new Date(expense.date).toLocaleDateString()}
      </td>
      <td className="py-4">
        <button
          onClick={onMoreClick}
          className="p-2 hover:bg-gray-700 rounded-lg"
        >
          <MoreVertical size={16} />
        </button>
      </td>
    </tr>
  );
};
