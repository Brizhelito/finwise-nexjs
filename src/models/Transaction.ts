import Decimal from "decimal.js";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export interface DailyTransactionMetrics {
  date: string;
  income: string;
  expense: string;
}

// Definimos la interfaz para los datos de la transacción
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: "income" | "expense";
  categoryId?: number;
  minAmount?: number; // Monto mínimo
  maxAmount?: number; // Monto máximo
  description?: string; // Nuevo filtro por descripción
  userId: number;
  sortBy?: "amount" | "createdAt";
  sortDirection?: "asc" | "desc"; // Dirección del orden
}

export interface TransactionData {
  amount: number;
  description: string;
  user_id: number;
  category_id?: number;
  type: "income" | "expense";
}
export interface CreateTransactionData {
  amount: number;
  description: string;
  category_id?: number;
  type: "income" | "expense";
}
export default class Transaction {
  // Método para actualizar el balance del presupuesto
  private static async updateBudgetBalance(
    budgetId: number,
    amount: Decimal,
    type: "income" | "expense"
  ) {
    const budget = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!budget) {
      throw new Error("Budget not found.");
    }

    const budgetAmount = new Decimal(budget.balance);

    let newBalance: Decimal;
    if (type === "expense") {
      if (budgetAmount.lessThan(amount)) {
        throw new Error("Insufficient funds in the budget.");
      }
      newBalance = budgetAmount.minus(amount);
    } else {
      newBalance = budgetAmount.plus(amount);
    }

    await prisma.budget.update({
      where: { id: budgetId },
      data: { balance: newBalance.toString() },
    });
  }

  static async create(data: TransactionData) {
    const amount = new Decimal(data.amount);

    // Iniciar una transacción de Prisma
    const transaction = await prisma.$transaction(async (prisma) => {
      // Actualizar el balance del presupuesto

      const budgetId = await Transaction.getBudgetIdFromUser(data.user_id);
      await Transaction.updateBudgetBalance(budgetId, amount, data.type);
      // Crear la transacción
      return prisma.transaction.create({
        data: {
          amount: amount.toString(),
          description: data.description,
          user_id: data.user_id,
          budget_id: budgetId,
          category_id: data.category_id,
          type: data.type,
        },
      });
    });

    return transaction;
  }

  static async update(id: number, data: TransactionData) {
    const transaction = await Transaction.findTransactionById(id);
    if (!transaction) {
      throw new Error("Transaction not found.");
    }

    const amount = new Decimal(data.amount);
    const oldAmount = new Decimal(transaction.amount);

    // Iniciar una transacción de Prisma
    const updatedTransaction = await prisma.$transaction(async (prisma) => {
      // Actualizar el balance del presupuesto
      const budgetId = await Transaction.getBudgetIdFromUser(data.user_id);

      await Transaction.updateBudgetBalance(
        budgetId,
        amount.minus(oldAmount),
        data.type
      );

      // Actualizar la transacción
      return prisma.transaction.update({
        where: { id },
        data: {
          amount: amount.toString(),
          description: data.description,
          user_id: data.user_id,
          budget_id: budgetId,
          category_id: data.category_id,
          type: data.type,
        },
      });
    });

    return updatedTransaction;
  }

  static async getAllByUserId(userId: number) {
    return prisma.transaction.findMany({ where: { user_id: userId } });
  }
  static findTransactionById(id: number) {
    return prisma.transaction.findUnique({ where: { id } });
  }

  static async delete(id: number, userId: number) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      console.error(`❌ Error: No se encontró la transacción con ID: ${id}`);
      throw new Error("Transaction not found.");
    }

    // Asegurar que la transacción pertenece al usuario
    if (transaction.user_id !== userId) {
      console.error(
        `⚠️ Error: Usuario ${userId} no tiene permiso para borrar la transacción ${id}`
      );
      throw new Error("Unauthorized: Transaction does not belong to user.");
    }


    const amount = new Decimal(transaction.amount);

    try {
      // Iniciar una transacción de Prisma
      const deletedTransaction = await prisma.$transaction(async (prisma) => {


        const budgetId = transaction.budget_id;
        if (!budgetId) {
          console.error(
            `❌ Error: No se encontró un presupuesto asociado a la transacción.`
          );
          throw new Error("Budget not found.");
        }


        if (transaction.type === "income") {
          await Transaction.updateBudgetBalance(
            budgetId,
            amount,
            "expense"
          );
        } else {

          await Transaction.updateBudgetBalance(budgetId, amount, "income");
        }
        return prisma.transaction.delete({ where: { id } });
      });

      return deletedTransaction;
    } catch (error) {
      console.error(`❌ Error al eliminar la transacción:`, error);
      throw new Error("Failed to delete transaction.");
    }
  }

  static async getFilteredTransactions(filters: TransactionFilters) {
    const {
      startDate,
      endDate,
      type,
      categoryId,
      userId,
      maxAmount,
      minAmount,
      description,
      sortBy,
      sortDirection = "asc",
    } = filters;

    // Construir el objeto de filtro dinámicamente
    const where: {
      user_id: number;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      type?: "income" | "expense";
      category_id?: number;
      amount?: {
        gte?: number;
        lte?: number;
      };
      description?: { contains: string; mode: "insensitive" }; // Agregamos el filtro de descripción
    } = { user_id: userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (type) {
      where.type = type;
    }

    if (categoryId) {
      where.category_id = categoryId;
    }
    if (minAmount || maxAmount) {
      where.amount = {};
      if (minAmount) {
        where.amount.gte = minAmount;
      }
      if (maxAmount) {
        where.amount.lte = maxAmount;
      }
    }
    if (description) {
      where.description = { contains: description, mode: "insensitive" };
    }
    const orderBy = sortBy ? { [sortBy]: sortDirection } : undefined;
    // Ejecutar la consulta
    return prisma.transaction.findMany({ where, orderBy });
  }

  static async getMonthlySummary(userId: number) {
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    const transactions = await Transaction.getFilteredTransactions({
      userId,
      startDate,
      endDate,
    });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc.plus(t.amount), new Decimal(0));

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc.plus(t.amount), new Decimal(0));

    return { income, expenses };
  }
  static async getMonthlySummaryByCategory(userId: number) {
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    const transactions = await Transaction.getFilteredTransactions({
      userId,
      startDate,
      endDate,
    });

    const categories = await prisma.category.findMany();

    const summary = categories.map((category) => {
      const total = transactions
        .filter((t) => t.category_id === category.id)
        .reduce((acc, t) => acc.plus(t.amount), new Decimal(0));

      return { category: category.name, total };
    });

    return summary;
  }

  static async getMontlyTransactionsMetrics(
    userId: number
  ): Promise<DailyTransactionMetrics[]> {
    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    const transactions = await prisma.transaction.groupBy({
      by: ["type", "createdAt"],
      _sum: { amount: true },
      where: { user_id: userId, createdAt: { gte: startDate, lte: endDate } },
      orderBy: { createdAt: "asc" }, // 🔥 Ordenar por fecha ASC desde la BD
    });

    // Group by day
    const groupedByDay = transactions.reduce(
      (
        acc: { [key: string]: { income: Decimal; expense: Decimal } },
        transaction
      ) => {
        const date = transaction.createdAt.toISOString().split("T")[0]; // Extraer solo la fecha
        if (!acc[date]) {
          acc[date] = { income: new Decimal(0), expense: new Decimal(0) };
        }
        acc[date][transaction.type] = acc[date][transaction.type].plus(
          transaction._sum.amount || new Decimal(0)
        );
        return acc;
      },
      {}
    );

    // Convertir a DailyTransactionMetrics[]
    const metrics: DailyTransactionMetrics[] = Object.keys(groupedByDay).map(
      (date) => ({
        date,
        income: groupedByDay[date].income.toString(),
        expense: groupedByDay[date].expense.toString(),
      })
    );

    return metrics;
  }

  private static async getBudgetIdFromUser(userId: number) {
    const budget = await prisma.budget.findFirst({
      where: { user_id: userId },
    });
    if (!budget) {
      throw new Error("Budget not found.");
    }
    return budget.id;
  }
}
