import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import Transaction, { TransactionFilters } from "@/models/Transaction";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const searchParams = req.nextUrl.searchParams;
  const userId = Number(cookieStore.get("x-user-id")?.value);
  const filter: TransactionFilters = {
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    type: searchParams.get("type") as "income" | "expense" | undefined,
    categoryId: searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined,
    minAmount: Number(searchParams.get("minAmount")) || undefined,
    maxAmount: Number(searchParams.get("maxAmount")) || undefined,
    description: searchParams.get("description") || undefined,
    sortBy:
      (searchParams.get("sortBy") as "amount" | "createdAt" | undefined) ||
      "createdAt",
    sortDirection:
      (searchParams.get("sortDirection") as "asc" | "desc" | undefined) ||
      "desc",
    userId,
  };
  const filteredTransactions = await Transaction.getFilteredTransactions(
    filter
  );
  return NextResponse.json(filteredTransactions);
}
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("x-user-id")?.value);
  try {
    const data = await req.json();
    const transaction = await Transaction.create({ ...data, user_id: userId });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function PUT(req: NextRequest) {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get("x-user-id")?.value);
  try {
    const data = await req.json();
    console.log(data);
    const transaction = await Transaction.update(data.id, {
      ...data,
      user_id: userId,
    });
    return NextResponse.json(transaction);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    await Transaction.delete(data.id);
    return NextResponse.json({ message: "Transaction deleted." });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
