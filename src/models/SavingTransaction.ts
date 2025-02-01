import prisma from "@/lib/prisma";
import { SavingTransaction as savingTransaction } from "@prisma/client";
import Decimal from "decimal.js";
import { SavingType } from "@prisma/client";
export interface FilterSavingTransaction {
  startDate?: Date;
  endDate?: Date;
  type?: SavingType | undefined;
  savingGoalId?: number;
  minAmount?: number;
  maxAmount?: number;
  sortDirection?: "asc" | "desc";
  sortBy?: "amount" | "createdAt";
  userId: number;
}
export interface UpdateSavingTransactionData {
  amount: number;
  type: string;
  saving_goal_id: number;
  id: number;
}
export interface CreateSavingTransactionData {
  amount: number;
  type: string;
  saving_goal_id: number;
}
export interface CreateSavingTransaction {
  user_id: number;
  amount: Decimal;
  type: SavingType;
  savingGoalId: number;
}
export class SavingTransaction {
  static async create(
    data: CreateSavingTransaction
  ): Promise<savingTransaction> {
    const userId = data.user_id;
    const saving = await this.getSavingIdByUserId(userId);
    const savingGoal = await this.getSavingGoalBySavingGoalId(
      data.savingGoalId
    );
    const budget = await this.getBudgetByUserId(userId);
    if (!saving) {
      throw new Error("Saving account not found");
    }
    if (!savingGoal) {
      throw new Error("Saving goal not found");
    }
    if (!budget) {
      throw new Error("Budget not found");
    }
    if (data.type === SavingType.withdrawal) {
      if (saving.total_saved.lessThanOrEqualTo(data.amount)) {
        throw new Error("Insufficient funds");
      } else {
        budget.balance = budget.balance.add(data.amount);
        savingGoal.currentAmount = savingGoal.currentAmount.sub(data.amount);
        saving.total_saved = saving.total_saved.sub(data.amount);
      }
    }
    if (data.type === SavingType.deposit) {
      if (budget.balance.lessThan(data.amount)) {
        throw new Error("Insufficient funds");
      } else if (
        savingGoal.currentAmount
          .add(data.amount)
          .greaterThan(savingGoal.targetAmount)
      ) {
        throw new Error("The saving goal amount will be exceeded");
      } else {
        budget.balance = budget.balance.sub(data.amount);
        savingGoal.currentAmount = savingGoal.currentAmount.add(data.amount);
        saving.total_saved = saving.total_saved.add(data.amount);
      }
    }
    if (savingGoal.currentAmount.greaterThan(savingGoal.targetAmount)) {
      throw new Error("The saving goal amount will be exceeded");
    }
    if (savingGoal.currentAmount.equals(savingGoal.targetAmount)) {
      savingGoal.isCompleted = true;
    }
    const transaction = prisma.$transaction(async (prisma) => {
      await prisma.budget.update({
        where: {
          id: budget.id,
        },
        data: {
          balance: budget.balance,
        },
      });
      await prisma.savingGoal.update({
        where: {
          id: savingGoal.id,
        },
        data: {
          currentAmount: savingGoal.currentAmount,
        },
      });
      await prisma.saving.update({
        where: {
          id: saving.id,
        },
        data: {
          total_saved: saving.total_saved,
        },
      });
      return prisma.savingTransaction.create({
        data: {
          user_id: userId,
          amount: data.amount,
          type: data.type,
          saving_id: saving.id,
          saving_goal_id: savingGoal.id,
        },
      });
    });
    return transaction;
  }
  static async getFilteredSavingTransactions(filter: FilterSavingTransaction) {
    const where: {
      user_id: number;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      type?: SavingType;
      saving_goal_id?: number;
      amount?: {
        gte?: number;
        lte?: number;
      };
    } = { user_id: filter.userId };

    if (filter.startDate || filter.endDate) {
      where.createdAt = {};
      if (filter.startDate) {
        where.createdAt.gte = filter.startDate;
      }
      if (filter.endDate) {
        where.createdAt.lte = filter.endDate;
      }
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.savingGoalId) {
      where.saving_goal_id = filter.savingGoalId;
    }
    if (filter.minAmount || filter.maxAmount) {
      where.amount = {};
      if (filter.minAmount) {
        where.amount.gte = filter.minAmount;
      }
      if (filter.maxAmount) {
        where.amount.lte = filter.maxAmount;
      }
    }

    const orderBy = filter.sortBy
      ? { [filter.sortBy]: filter.sortDirection }
      : undefined;
    return prisma.savingTransaction.findMany({ where, orderBy });
  }

  private static async getSavingIdByUserId(userId: number) {
    return prisma.saving.findFirst({
      where: {
        user_id: userId,
      },
    });
  }
  private static getSavingGoalBySavingGoalId(savingGoalId: number) {
    return prisma.savingGoal.findFirst({
      where: {
        id: savingGoalId,
      },
    });
  }
  private static async getBudgetByUserId(userId: number) {
    return prisma.budget.findFirst({
      where: {
        user_id: userId,
      },
    });
  }
  static async updateSavingTransaction(
    transactionId: number,
    data: Partial<CreateSavingTransaction>
  ): Promise<savingTransaction> {
    // 1. Obtener la transacción original
    const originalTransaction = await prisma.savingTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!originalTransaction) {
      throw new Error("Transaction not found");
    }

    // 2. Obtener todas las entidades relacionadas
    const userId = originalTransaction.user_id;
    const [saving, savingGoal, budget] = await Promise.all([
      this.getSavingIdByUserId(userId),
      this.getSavingGoalBySavingGoalId(
        data.savingGoalId || originalTransaction.saving_goal_id
      ),
      this.getBudgetByUserId(userId),
    ]);

    if (!saving || !savingGoal || !budget) {
      throw new Error("Required related records not found");
    }

    // 3. Revertir los efectos de la transacción original
    if (originalTransaction.type === SavingType.withdrawal) {
      budget.balance = budget.balance.sub(originalTransaction.amount);
      savingGoal.currentAmount = savingGoal.currentAmount.add(
        originalTransaction.amount
      );
      saving.total_saved = saving.total_saved.add(originalTransaction.amount);
    } else {
      budget.balance = budget.balance.add(originalTransaction.amount);
      savingGoal.currentAmount = savingGoal.currentAmount.sub(
        originalTransaction.amount
      );
      saving.total_saved = saving.total_saved.sub(originalTransaction.amount);
    }

    // 4. Validar y aplicar la nueva transacción
    const newAmount = data.amount || originalTransaction.amount;
    const newType = data.type || originalTransaction.type;

    // Validaciones para la nueva transacción
    if (newType === SavingType.withdrawal) {
      if (saving.total_saved.lessThan(newAmount)) {
        throw new Error("Insufficient funds for withdrawal");
      }
      budget.balance = budget.balance.add(newAmount);
      savingGoal.currentAmount = savingGoal.currentAmount.sub(newAmount);
      saving.total_saved = saving.total_saved.sub(newAmount);
    } else {
      if (budget.balance.lessThan(newAmount)) {
        throw new Error("Insufficient budget balance for deposit");
      }
      if (
        savingGoal.currentAmount
          .add(newAmount)
          .greaterThan(savingGoal.targetAmount)
      ) {
        throw new Error("The saving goal amount would be exceeded");
      }
      budget.balance = budget.balance.sub(newAmount);
      savingGoal.currentAmount = savingGoal.currentAmount.add(newAmount);
      saving.total_saved = saving.total_saved.add(newAmount);
    }

    // 5. Ejecutar todas las actualizaciones en una transacción
    return prisma.$transaction(async (prisma) => {
      // Actualizar el presupuesto
      await prisma.budget.update({
        where: { id: budget.id },
        data: { balance: budget.balance },
      });

      // Actualizar la meta de ahorro
      await prisma.savingGoal.update({
        where: { id: savingGoal.id },
        data: {
          currentAmount: savingGoal.currentAmount,
          isCompleted: savingGoal.currentAmount.equals(savingGoal.targetAmount),
        },
      });

      // Actualizar el ahorro total
      await prisma.saving.update({
        where: { id: saving.id },
        data: { total_saved: saving.total_saved },
      });

      // Actualizar la transacción
      return prisma.savingTransaction.update({
        where: { id: transactionId },
        data: {
          amount: newAmount,
          type: newType,
          saving_goal_id:
            data.savingGoalId || originalTransaction.saving_goal_id,
        },
      });
    });
  }

  static async deleteSavingTransaction(
    transactionId: number
  ): Promise<savingTransaction> {
    const transaction = await prisma.savingTransaction.findUnique({
      where: {
        id: transactionId,
      },
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    const userId = transaction.user_id;
    const saving = await this.getSavingIdByUserId(userId);
    const savingGoal = await this.getSavingGoalBySavingGoalId(
      transaction.saving_goal_id
    );
    const budget = await this.getBudgetByUserId(userId);

    if (!saving || !savingGoal || !budget) {
      throw new Error("Related records not found");
    }

    if (transaction.type === SavingType.withdrawal) {
      budget.balance = budget.balance.sub(transaction.amount);
      savingGoal.currentAmount = savingGoal.currentAmount.add(
        transaction.amount
      );
      saving.total_saved = saving.total_saved.add(transaction.amount);
    } else if (transaction.type === SavingType.deposit) {
      budget.balance = budget.balance.add(transaction.amount);
      savingGoal.currentAmount = savingGoal.currentAmount.sub(
        transaction.amount
      );
      saving.total_saved = saving.total_saved.sub(transaction.amount);
    }

    return prisma.$transaction(async (prisma) => {
      await prisma.budget.update({
        where: {
          id: budget.id,
        },
        data: {
          balance: budget.balance,
        },
      });

      await prisma.savingGoal.update({
        where: {
          id: savingGoal.id,
        },
        data: {
          currentAmount: savingGoal.currentAmount,
        },
      });

      await prisma.saving.update({
        where: {
          id: saving.id,
        },
        data: {
          total_saved: saving.total_saved,
        },
      });

      return prisma.savingTransaction.delete({
        where: {
          id: transactionId,
        },
      });
    });
  }
}
