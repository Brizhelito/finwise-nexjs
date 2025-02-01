// src/repositories/categoryRepository.ts
import { Prisma, Category } from "@prisma/client";
import prisma from "@/lib/prisma";

export const createCategory = async (
  data: Prisma.CategoryCreateInput
): Promise<Category> => {
  return prisma.category.create({
    data,
  });
};

export const getCategoryByName = async (
  name: string
): Promise<Category | null> => {
  return prisma.category.findUnique({
    where: { name },
  });
};

export const updateCategory = async (
  id: number,
  data: Prisma.CategoryUpdateInput
): Promise<Category> => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategory = async (id: number): Promise<Category> => {
  return prisma.category.delete({
    where: { id },
  });
};
export const getAllCategories = async (): Promise<Category[]> => {
  return prisma.category.findMany(); // Método para obtener todas las categorías
};
