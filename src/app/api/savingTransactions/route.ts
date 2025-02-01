import {
  SavingTransaction,
  CreateSavingTransaction,
} from "@/models/SavingTransaction";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FilterSavingTransaction } from "@/models/SavingTransaction";
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("x-user-id")?.value);
  const body = await request.json();
  if (!body.amount || !body.type || !body.saving_goal_id) {
    return NextResponse.json(
      {
        status: 400,
        message: "Missing required field",
      },
      { status: 400 }
    );
  }
  const data: CreateSavingTransaction = {
    user_id: userId,
    amount: body.amount,
    type: body.type,
    savingGoalId: body.saving_goal_id,
  };
  const createSavingTransaction: CreateSavingTransaction = data;
  try {
    const savingTransaction = await SavingTransaction.create(
      createSavingTransaction
    );
    return NextResponse.json(savingTransaction);
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      {
        status: 400,
        message: errorMessage,
      },
      { status: 400 }
    );
  }
}
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("x-user-id")?.value);
  const searchParams = request.nextUrl.searchParams;
  const filter: FilterSavingTransaction = {
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    type: searchParams.get("type") as "deposit" | "withdrawal" | undefined,
    savingGoalId: searchParams.get("savingGoalId")
      ? Number(searchParams.get("savingGoalId"))
      : undefined,
    minAmount: Number(searchParams.get("minAmount")) || undefined,
    maxAmount: Number(searchParams.get("maxAmount")) || undefined,
    sortDirection:
      (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
    sortBy:
      (searchParams.get("sortBy") as "amount" | "createdAt") || "createdAt",
    userId,
  };
  try {
    const savingTransactions =
      await SavingTransaction.getFilteredSavingTransactions(filter);
    return NextResponse.json(savingTransactions);
  } catch (error) {
    console.error("Error", (error as Error).message);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function PUT(request: NextRequest) {
  const body = await request.json();
  console.log(body);
  // Validar campos requeridos
  if (!body.id || !body.amount || !body.type || !body.saving_goal_id) {
    return NextResponse.json(
      {
        status: 400,
        message: "Missing required field",
      },
      { status: 400 }
    );
  }

  const data: Partial<CreateSavingTransaction> = {
    amount: body.amount,
    type: body.type,
    savingGoalId: body.saving_goal_id,
  };

  try {
    const updatedTransaction = await SavingTransaction.updateSavingTransaction(
      body.id,
      data
    );
    return NextResponse.json(updatedTransaction);
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      {
        status: 400,
        message: errorMessage,
      },
      { status: 400 }
    );
  }
}

// Eliminar una transacción de ahorro
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get("id");

  // Validar que se proporcionó un ID
  if (!transactionId) {
    return NextResponse.json(
      {
        status: 400,
        message: "Transaction ID is required",
      },
      { status: 400 }
    );
  }

  try {
    const deletedTransaction = await SavingTransaction.deleteSavingTransaction(
      Number(transactionId)
    );
    return NextResponse.json(deletedTransaction);
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      {
        status: 400,
        message: errorMessage,
      },
      { status: 400 }
    );
  }
}
