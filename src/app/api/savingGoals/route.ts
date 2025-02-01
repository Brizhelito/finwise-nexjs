import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import Decimal from "decimal.js";

export interface CreateSavingGoalData {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  due_date: Date;
}

export interface SavingGoalFilter {
  userId: number;
  name?: string;
  startDate?: Date;
  endDate?: Date;
  dueDate?: Date;
  sortDirection?: "asc" | "desc";
  sortBy?: "name" | "targetAmount" | "dueDate" | "currentAmount";
  isCompleted?: boolean;
}

export class SavingGoal {
  static async create(data: {
    name: string;
    targetAmount: number;
    user_id: number;
    due_date: Date;
    currentAmount?: Decimal;
  }) {
    const savingGoalData = { ...data, currentAmount: new Decimal(0) };
    return prisma.savingGoal.create({ data: savingGoalData });
  }

  static async getFilteredSavingGoals(data: SavingGoalFilter) {
    const where: {
      user_id: number;
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
      name?: { contains: string; mode: "insensitive" };
      due_date?: { gte?: Date; lte?: Date };
      isCompleted?: boolean;
    } = { user_id: data.userId };

    const sortBy = data.sortBy ? { [data.sortBy]: data.sortDirection } : {};

    if (data.startDate || data.endDate) {
      where.createdAt = {};
      if (data.startDate) where.createdAt.gte = data.startDate;
      if (data.endDate) where.createdAt.lte = data.endDate;
    }

    if (data.name) {
      where.name = { contains: data.name, mode: "insensitive" };
    }

    if (data.dueDate) {
      where.due_date = { gte: data.dueDate };
    }

    if (data.isCompleted !== undefined) {
      where.isCompleted = data.isCompleted;
    }

    return prisma.savingGoal.findMany({
      where,
      orderBy: sortBy,
    });
  }

  static async update(id: number, data: Partial<CreateSavingGoalData>) {
    return prisma.savingGoal.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.savingGoal.delete({ where: { id } });
  }

  static async getAllByUserId(userId: number) {
    return prisma.savingGoal.findMany({ where: { user_id: userId } });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const userId = Number((await cookieStore).get("x-user-id")?.value);

  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  if (!body.name || !body.targetAmount || !body.due_date) {
    return NextResponse.json(
      { status: 400, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const data = {
    name: body.name,
    targetAmount: body.targetAmount,
    user_id: userId,
    due_date: new Date(body.due_date),
  };

  try {
    const savingGoal = await SavingGoal.create(data);
    return NextResponse.json(savingGoal, { status: 201 });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { status: 500, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const userId = Number((await cookieStore).get("x-user-id")?.value);

  if (!userId) {
    return NextResponse.json(
      { status: 401, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const filter: SavingGoalFilter = {
    userId,
    startDate: searchParams.get("startDate")
      ? new Date(searchParams.get("startDate") as string)
      : undefined,
    endDate: searchParams.get("endDate")
      ? new Date(searchParams.get("endDate") as string)
      : undefined,
    name: searchParams.get("name") || undefined,
    sortDirection:
      (searchParams.get("sortDirection") as "asc" | "desc") || "desc",
    sortBy:
      (searchParams.get("sortBy") as
        | "name"
        | "targetAmount"
        | "currentAmount"
        | "dueDate") || "name",
  };

  if (searchParams.get("isCompleted")) {
    filter.isCompleted = searchParams.get("isCompleted") === "true";
  }

  try {
    const savingGoals = await SavingGoal.getFilteredSavingGoals(filter);
    return NextResponse.json(savingGoals);
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json(
      { status: 500, message: errorMessage },
      { status: 500 }
    );
  }
}
