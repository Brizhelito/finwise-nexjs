import { NextResponse } from "next/server";
import { getFinancialMetrics } from "@/utils/metrics";
import { cookies } from "next/headers";
import { FinancialMetrics } from "@/utils/metrics";
// Función de utilidad para verificar datos vacíos
function isDataEmpty(data: FinancialMetrics): boolean {
  // Verificar incomeVsExpenses con optional chaining y valores por defecto
  const isIncomeVsExpensesEmpty =
    (data.incomeVsExpenses?.income ?? 0) === 0 &&
    (data.incomeVsExpenses?.expenses ?? 0) === 0 &&
    (data.incomeVsExpenses?.balance ?? 0) === 0;

  // Verificar savingsRate con optional chaining y valores por defecto
  const isSavingsRateEmpty =
    (data.savingsRate?.monthlySavingsRate ?? 0) === 0 &&
    (data.savingsRate?.projectedYearlySavings ?? 0) === 0;

  // Verificar otros campos
  const areOtherFieldsEmpty =
    data.topExpenseCategories?.length === 0 &&
    data.budgetAlerts?.length === 0 &&
    data.highestTransaction === null &&
    data.expenseTrend?.length === 0 &&
    data.savingsGoalProgress?.length === 0 &&
    data.categoryTrends?.length === 0 &&
    data.highestGrowthCategory === null &&
    data.longestExpenseFreeStreak === null;

  return isIncomeVsExpensesEmpty && isSavingsRateEmpty && areOtherFieldsEmpty;
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("x-user-id")?.value;

  if (!userId) {
    return NextResponse.json(
      { error: "El parámetro userId es requerido" },
      { status: 400 }
    );
  }

  const userIdNumber = Number(userId);
  if (isNaN(userIdNumber)) {
    return NextResponse.json(
      { error: "El parámetro userId debe ser un número" },
      { status: 400 }
    );
  }

  try {
    const financialMetrics = await getFinancialMetrics(userIdNumber);

    if (isDataEmpty(financialMetrics)) {
      return NextResponse.json(
        { error: "No se encontraron datos financieros" },
        { status: 404 } // 404 Not Found o 204 No Content según tu caso
      );
    }

    return NextResponse.json(financialMetrics);
  } catch (error) {
    console.error("Error al obtener métricas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
