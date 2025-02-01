// app/api/categories/route.ts
import { NextResponse } from "next/server";
import * as categoryService from "@/services/categoryService";

export async function GET() {
  try {
    const categories = await categoryService.getAllCategories();
    if (!categories) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = await categoryService.createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
