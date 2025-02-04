// types.ts
export interface IncomeVsExpenses {
  income: number;
  expenses: number;
  balance: number;
}

export interface SavingsRate {
  monthlySavingsRate: number;
  projectedYearlySavings: number;
}

export interface ExpenseCategory {
  categoryName: string;
  totalAmount: number;
}

export interface HighestTransaction {
  amount: number;
  description: string;
  date: string;
}

export interface ExpenseTrendItem {
  month: string;
  totalExpenses: number;
}

export interface SavingsGoal {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  percentage: number;
}
// types.ts
export interface CategoryTrend {
  categoryName: string;
  trend: "upward" | "downward" | "stable";
  percentageChange: number;
}

export interface GrowthCategory {
  categoryName: string;
  previousMonthTotal: number;
  currentMonthTotal: number;
  percentageIncrease: number;
}

export interface ExpenseFreeStreak {
  startDate: string;
  endDate: string;
  daysWithoutExpenses: number;
}


export interface DashboardMetrics {
  incomeVsExpenses?: IncomeVsExpenses;
  savingsRate?: SavingsRate;
  topExpenseCategories?: ExpenseCategory[];
  budgetRemainingDays?: number;
  budgetAlerts?: { type: "warning" | "critical"; message: string }[] | null;
  highestTransaction?: HighestTransaction;
  expenseTrend?: ExpenseTrendItem[];
  savingsGoalProgress?: SavingsGoal[];
  categoryTrends?: CategoryTrend[] | null;
  highestGrowthCategory?: GrowthCategory | null;
  longestExpenseFreeStreak?: ExpenseFreeStreak | null;
}
