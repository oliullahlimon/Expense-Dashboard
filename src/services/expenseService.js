import apiService from "./apiService";

const expenseService = {
  getExpenses: () => apiService.get("/expense"),

  getExpenseById: (expenseId) => apiService.get(`/expense/${expenseId}`),

  createExpense: (expenseData) => apiService.post("/expense", expenseData),

  updateExpense: (expenseId, expenseData) => {
    return apiService.put(`/expense/${expenseId}`, expenseData);
  },

  deleteExpense: (expenseId) => apiService.delete(`/expense/${expenseId}`),
};

export default expenseService;
