import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {SavingGoal, SavingGoalFilter} from "@/models/SavingGoal";
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
