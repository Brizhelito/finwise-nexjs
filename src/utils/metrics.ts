// Importamos funciones de date-fns para manejo de fechas
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  differenceInDays,
  format,
} from "date-fns";
// Importamos el cliente de Prisma (ajusta la ruta según tu proyecto)
import prisma from "@/lib/prisma";

/**
 * Interfaz que representa las métricas financieras.
 */
export interface FinancialMetrics {
  incomeVsExpenses: {
    income: number;
    expenses: number;
    balance: number;
  };
  savingsRate: {
    monthlySavingsRate: number;
    projectedYearlySavings: number;
  };
  topExpenseCategories: Array<{
    categoryName: string;
    totalAmount: number;
  }>;
  budgetRemainingDays: number;
  budgetAlerts: Array<{
    type: "warning" | "critical";
    message: string;
  }>;
  highestTransaction: {
    amount: number;
    description: string;
    date: Date;
  } | null;
  expenseTrend: Array<{
    month: string;
    totalExpenses: number;
  }>;
  savingsGoalProgress: Array<{
    goalName: string;
    currentAmount: number;
    targetAmount: number;
    percentage: number;
  }>;
  categoryTrends: Array<{
    categoryName: string;
    trend: "upward" | "downward" | "stable";
    percentageChange: number;
  }>;
  highestGrowthCategory: {
    categoryName: string;
    previousMonthTotal: number;
    currentMonthTotal: number;
    percentageIncrease: number;
  } | null;
  longestExpenseFreeStreak: {
    startDate: Date;
    endDate: Date;
    daysWithoutExpenses: number;
  } | null;
}

async function getCategoryTrends(
  userId: number,
  now: Date
): Promise<
  Array<{
    categoryName: string;
    trend: "upward" | "downward" | "stable";
    percentageChange: number;
  }>
> {
  try {
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    // Obtener gastos por categoría para el mes actual y el anterior
    const currentMonthExpenses = await prisma.transaction.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId,
        type: "expense",
        createdAt: { gte: currentMonthStart, lte: currentMonthEnd },
      },
      _sum: { amount: true },
    });

    const previousMonthExpenses = await prisma.transaction.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId,
        type: "expense",
        createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
      },
      _sum: { amount: true },
    });

    // Mapear resultados con nombres de categorías
    const categoryTrends = await Promise.all(
      currentMonthExpenses.map(async (currentCategory) => {
        const categoryDetails = await prisma.category.findUnique({
          where: { id: currentCategory.category_id! },
        });

        const previousCategoryExpense = previousMonthExpenses.find(
          (p) => p.category_id === currentCategory.category_id
        );

        const previousAmount = Number(
          previousCategoryExpense?._sum.amount || 0
        );
        const currentAmount = Number(currentCategory._sum.amount || 0);

        let trend: "upward" | "downward" | "stable" = "stable";
        const percentageChange =
          previousAmount > 0
            ? ((currentAmount - previousAmount) / previousAmount) * 100
            : 0;

        if (percentageChange > 10) trend = "upward";
        if (percentageChange < -10) trend = "downward";

        return {
          categoryName: categoryDetails?.name || "Uncategorized",
          trend,
          percentageChange,
        };
      })
    );

    return categoryTrends;
  } catch (error) {
    console.error("Error en getCategoryTrends:", error);
    throw error;
  }
}

/**
 * Encuentra la categoría con el mayor incremento respecto al mes anterior.
 * @param categoryTrends - Tendencias de categorías previamente calculadas.
 * @returns Categoría con mayor crecimiento o null.
 */
function findHighestGrowthCategory(
  categoryTrends: Array<{
    categoryName: string;
    percentageChange: number;
  }>
): {
  categoryName: string;
  previousMonthTotal: number;
  currentMonthTotal: number;
  percentageIncrease: number;
} | null {
  if (categoryTrends.length === 0) return null;

  const highestGrowthCategory = categoryTrends.reduce((max, category) =>
    category.percentageChange > max.percentageChange ? category : max
  );

  return highestGrowthCategory.percentageChange > 0
    ? {
        categoryName: highestGrowthCategory.categoryName,
        previousMonthTotal: 0, // Nota: Implementación completa requeriría más datos
        currentMonthTotal: 0,
        percentageIncrease: highestGrowthCategory.percentageChange,
      }
    : null;
}

/**
 * Calcula la racha más larga sin gastos.
 * @param userId - Identificador del usuario.
 * @returns Racha más larga sin gastos.
 */
async function getLongestExpenseFreeStreak(userId: number): Promise<{
  startDate: Date;
  endDate: Date;
  daysWithoutExpenses: number;
} | null> {
  try {
    // Obtener todas las transacciones de gasto ordenadas por fecha
    const expenseTransactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: "expense",
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });

    if (expenseTransactions.length === 0) return null;

    let longestStreak = 0;
    let longestStreakStart: Date | null = null;
    let longestStreakEnd: Date | null = null;

    // Calcular la diferencia entre transacciones
    for (let i = 1; i < expenseTransactions.length; i++) {
      const prevDate = expenseTransactions[i - 1].createdAt;
      const currentDate = expenseTransactions[i].createdAt;

      const daysDifference = differenceInDays(currentDate, prevDate);

      if (daysDifference > longestStreak) {
        longestStreak = daysDifference;
        longestStreakStart = prevDate;
        longestStreakEnd = currentDate;
      }
    }

    return longestStreak > 0
      ? {
          startDate: longestStreakStart!,
          endDate: longestStreakEnd!,
          daysWithoutExpenses: longestStreak,
        }
      : null;
  } catch (error) {
    console.error("Error en getLongestExpenseFreeStreak:", error);
    throw error;
  }
}


/**
 * Obtiene los ingresos y gastos del mes actual agrupados por tipo.
 * @param userId - Identificador del usuario.
 * @param start - Inicio del mes.
 * @param end - Fin del mes.
 * @returns Objeto con ingresos y gastos.
 */
async function getIncomeVsExpenses(
  userId: number,
  start: Date,
  end: Date
): Promise<{ income: number; expenses: number }> {
  try {
    // Agrupamos las transacciones del mes actual por tipo
    const monthlyTransactions = await prisma.transaction.groupBy({
      by: ["type"],
      where: {
        user_id: userId,
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    // Debug: Mostrar transacciones agrupadas

    // Obtenemos el total de ingresos y gastos
    const income =
      Number(
        monthlyTransactions.find((t) => t.type === "income")?._sum.amount
      ) || 0;
    const expenses =
      Number(
        monthlyTransactions.find((t) => t.type === "expense")?._sum.amount
      ) || 0;

    // Debug: Mostrar ingresos y gastos calculados

    return { income, expenses };
  } catch (error) {
    console.error("Error en getIncomeVsExpenses:", error);
    throw error;
  }
}

/**
 * Calcula la tasa de ahorro mensual y el ahorro anual proyectado.
 * @param userId - Identificador del usuario.
 * @param start - Inicio del mes.
 * @param end - Fin del mes.
 * @param income - Total de ingresos del mes.
 * @returns Objeto con tasa de ahorro mensual y ahorro anual proyectado.
 */
async function getSavingsRate(
  userId: number,
  start: Date,
  end: Date,
  income: number
): Promise<{ monthlySavingsRate: number; projectedYearlySavings: number }> {
  try {
    // Consultamos las transacciones de ahorro del mes actual.
    const savingTransactions = await prisma.savingTransaction.findMany({
      where: {
        user_id: userId,
        createdAt: { gte: start, lte: end },
      },
    });

    // Debug: Mostrar transacciones de ahorro

    // Sumamos los depósitos
    const monthlySavings = savingTransactions.reduce(
      (sum, t) => (t.type === "deposit" ? sum + Number(t.amount) : sum),
      0
    );
    const monthlySavingsRate = income > 0 ? (monthlySavings / income) * 100 : 0;
    const projectedYearlySavings = monthlySavings * 12;

    // Debug: Mostrar tasa de ahorro y ahorro anual proyectado

    return { monthlySavingsRate, projectedYearlySavings };
  } catch (error) {
    console.error("Error en getSavingsRate:", error);
    throw error;
  }
}

/**
 * Obtiene las 5 principales categorías de gasto del último mes.
 * @param userId - Identificador del usuario.
 * @param now - Fecha actual.
 * @returns Arreglo con las categorías y su monto total.
 */
async function getTopExpenseCategories(
  userId: number,
  now: Date
): Promise<Array<{ categoryName: string; totalAmount: number }>> {
  try {
    // Agrupar gastos del último mes por categoría
    const grouped = await prisma.transaction.groupBy({
      by: ["category_id"],
      where: {
        user_id: userId,
        type: "expense",
        createdAt: { gte: subMonths(now, 1), lte: now },
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });


    const topCategories = await Promise.all(
      grouped.map(async (group) => {
        const categoryDetails = await prisma.category.findUnique({
          where: { id: group.category_id! },
        });
        return {
          categoryName: categoryDetails?.name || "Uncategorized",
          totalAmount: Number(group._sum.amount),
        };
      })
    );

    return topCategories;
  } catch (error) {
    console.error("Error en getTopExpenseCategories:", error);
    throw error;
  }
}

/**
 * Calcula los días restantes hasta el fin del mes y genera alertas de presupuesto.
 * @param userId - Identificador del usuario.
 * @param now - Fecha actual.
 * @param endOfMonthDate - Fin del mes.
 * @param expenses - Total de gastos del mes actual.
 * @returns Objeto con días restantes y alertas.
 */
async function getBudgetData(
  userId: number,
  now: Date,
  endOfMonthDate: Date,
  expenses: number
): Promise<{
  budgetRemainingDays: number;
  budgetAlerts: Array<{ type: "warning" | "critical"; message: string }>;
}> {
  try {
    const userBudget = await prisma.budget.findUnique({
      where: { user_id: userId },
    });


    const budgetRemainingDays = userBudget
      ? differenceInDays(endOfMonthDate, now)
      : 0;

    const budgetAlerts: Array<{
      type: "warning" | "critical";
      message: string;
    }> = [];
    if (userBudget) {
      const remainingBudget = Number(userBudget.balance);
      if (expenses > remainingBudget * 0.8) {
        budgetAlerts.push({
          type: expenses > remainingBudget ? "critical" : "warning",
          message: "Estás cerca de exceder tu presupuesto mensual",
        });
      }
    }

    return { budgetRemainingDays, budgetAlerts };
  } catch (error) {
    console.error("Error en getBudgetData:", error);
    throw error;
  }
}

/**
 * Obtiene la transacción de gasto con el mayor monto.
 * @param userId - Identificador del usuario.
 * @returns Objeto con la transacción más alta o null si no existe.
 */
async function getHighestTransaction(
  userId: number
): Promise<{ amount: number; description: string; date: Date } | null> {
  try {
    const record = await prisma.transaction.findFirst({
      where: { user_id: userId, type: "expense" },
      orderBy: { amount: "desc" },
    });

    // Debug: Mostrar la transacción con mayor monto
    return record
      ? {
          amount: Number(record.amount),
          description: record.description,
          date: record.createdAt,
        }
      : null;
  } catch (error) {
    console.error("Error en getHighestTransaction:", error);
    throw error;
  }
}

/**
 * Calcula la tendencia de gastos de los últimos 3 meses agrupados por mes.
 * @param userId - Identificador del usuario.
 * @param now - Fecha actual.
 * @returns Arreglo con la tendencia de gastos.
 */
async function getExpenseTrend(
  userId: number,
  now: Date
): Promise<Array<{ month: string; totalExpenses: number }>> {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: "expense",
        createdAt: { gte: subMonths(now, 3), lte: now },
      },
      select: { amount: true, createdAt: true },
    });

    // Agrupamos los gastos por mes en formato "YYYY-MM"
    const trendMap: { [month: string]: number } = {};
    transactions.forEach((tx) => {
      const month = format(tx.createdAt, "yyyy-MM");
      trendMap[month] = (trendMap[month] || 0) + Number(tx.amount);
    });

    // Debug: Mostrar mapa de tendencia
    // Convertimos el objeto en un arreglo de resultados
    const expenseTrend = Object.entries(trendMap).map(
      ([month, totalExpenses]) => ({
        month,
        totalExpenses,
      })
    );

    return expenseTrend;
  } catch (error) {
    console.error("Error en getExpenseTrend:", error);
    throw error;
  }
}

/**
 * Calcula el progreso de las metas de ahorro.
 * @param userId - Identificador del usuario.
 * @returns Arreglo con el progreso de cada meta.
 */
async function getSavingsGoalProgress(userId: number): Promise<
  Array<{
    goalName: string;
    currentAmount: number;
    targetAmount: number;
    percentage: number;
  }>
> {
  try {
    const goals = await prisma.savingGoal.findMany({
      where: { user_id: userId },
    });

    // Debug: Mostrar metas de ahorro

    const progress = goals.map((goal) => ({
      goalName: goal.name,
      currentAmount: Number(goal.currentAmount),
      targetAmount: Number(goal.targetAmount),
      percentage:
        (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
    }));

    return progress;
  } catch (error) {
    console.error("Error en getSavingsGoalProgress:", error);
    throw error;
  }
}

/**
 * Función principal que integra todas las métricas financieras del usuario.
 * @param userId - Identificador del usuario.
 * @returns Promesa que resuelve en las métricas financieras.
 */
export async function getFinancialMetrics(
  userId: number
): Promise<FinancialMetrics> {
  try {
    // Fechas base para cálculos
    const now = new Date();
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);

    // 1. Ingresos vs Gastos
    const { income, expenses } = await getIncomeVsExpenses(
      userId,
      startOfCurrentMonth,
      endOfCurrentMonth
    );

    // 2. Tasa de Ahorro y Ahorro Anual Proyectado
    const savingsRate = await getSavingsRate(
      userId,
      startOfCurrentMonth,
      endOfCurrentMonth,
      income
    );

    // 3. Top 5 Categorías de Gasto
    const topExpenseCategories = await getTopExpenseCategories(userId, now);

    // 4. Días Restantes y Alertas de Presupuesto
    const { budgetRemainingDays, budgetAlerts } = await getBudgetData(
      userId,
      now,
      endOfCurrentMonth,
      expenses
    );

    // 5. Transacción de Gasto Más Alta
    const highestTransaction = await getHighestTransaction(userId);

    // 6. Tendencia de Gastos de los Últimos 3 Meses
    const expenseTrend = await getExpenseTrend(userId, now);

    // 7. Progreso de Metas de Ahorro
    const savingsGoalProgress = await getSavingsGoalProgress(userId);

    const categoryTrends = await getCategoryTrends(userId, now);
    const highestGrowthCategory = findHighestGrowthCategory(categoryTrends);
    const longestExpenseFreeStreak = await getLongestExpenseFreeStreak(userId);


    // Consolidamos todas las métricas financieras
    const financialMetrics: FinancialMetrics = {
      incomeVsExpenses: {
        income,
        expenses,
        balance: income - expenses,
      },
      savingsRate,
      topExpenseCategories,
      budgetRemainingDays,
      budgetAlerts,
      highestTransaction,
      expenseTrend,
      savingsGoalProgress,
      categoryTrends,
      highestGrowthCategory,
      longestExpenseFreeStreak,
    };

    // Debug: Mostrar objeto final de métricas

    return financialMetrics;
  } catch (error) {
    console.error("Error en getFinancialMetrics:", error);
    throw error;
  }
}
