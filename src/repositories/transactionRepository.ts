// src/repositories/transactionRepository.ts
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
interface CreateTransactionData {
  amount: Prisma.Decimal;
  type: "income" | "expense";
  description: string;
  category_id: number | null;
  user_id: number;
}

interface Budget {
  id: number;
  balance: string;
}

interface Transaction {
  id: number;
  amount: Prisma.Decimal;
  type: string;
  description: string;
  category_id: number | null;
  user_id: number;
  budget_id: number;
}

interface ResponseData {
  newTransaction: Transaction;
  updated_balance: string;
}

export const createTransaction = async ({
  amount,
  type,
  description,
  category_id,
  user_id,
}: CreateTransactionData): Promise<ResponseData> => {
  if (!user_id) {
    throw new Error("El user_id es obligatorio");
  }

  // Obtener el presupuesto del usuario logueado
  const budgetData = await prisma.budget.findUnique({
    where: { user_id },
  });

  if (!budgetData) {
    throw new Error("Presupuesto no encontrado para el usuario");
  }

  const budget: Budget = {
    id: budgetData.id,
    balance: budgetData.balance.toString(),
  };

  // Validar que no se haga un gasto mayor al balance disponible
  if (
    type === "expense" &&
    parseFloat(amount.toString()) > parseFloat(budget.balance)
  ) {
    throw new Error(
      "El gasto no puede ser mayor al balance disponible en el presupuesto"
    );
  }

  // Validar la categoría para los gastos
  if (type === "expense" && !category_id) {
    throw new Error("La categoría es obligatoria para los gastos");
  }

  // Crear la nueva transacción (sin categoría si es un ingreso)
  const newTransaction = await prisma.transaction.create({
    data: {
      user: { connect: { id: user_id } }, // Conectar el usuario con la transacción
      amount,
      description,
      budget: { connect: { id: budget.id } },
      type,
      // Incluir category solo si no es null
      ...(type !== "income" &&
        category_id && {
          category: { connect: { id: category_id } }, // Solo incluir la categoría si no es un ingreso
        }),
    },
  });

  // Actualizar el balance del presupuesto
  if (type === "income") {
    budget.balance = (
      parseFloat(budget.balance) + parseFloat(amount.toString())
    ).toString();
  } else if (type === "expense") {
    budget.balance = (
      parseFloat(budget.balance) - parseFloat(amount.toString())
    ).toString();
  }

  // Guardar los cambios en el presupuesto
  await prisma.budget.update({
    where: { id: budget.id },
    data: { balance: budget.balance },
  });

  return { newTransaction, updated_balance: budget.balance };
};
export const getTransactionsByUserId = async (
  userId: number
): Promise<Transaction[]> => {
  return prisma.transaction.findMany({
    where: {
      user_id: userId,
    },
  });
};

export const updateTransaction = async (
  id: number,
  data: Prisma.TransactionUpdateInput
): Promise<Transaction> => {
  return prisma.transaction.update({
    where: { id },
    data,
  });
};

export const deleteTransaction = async (id: number): Promise<Transaction> => {
  return prisma.transaction.delete({
    where: { id },
  });
};
