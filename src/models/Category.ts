import prisma from "@/lib/prisma";

export interface CategoryData {
  id: number;
  name: string;
}
export class Category {
  static async create(data: { name: string }) {
    return prisma.category.create({ data });
  }

  static async findAll() {
    return prisma.category.findMany();
  }

  static async findById(id: number) {
    return prisma.category.findUnique({ where: { id } });
  }

  static async update(id: number, data: { name: string }) {
    return prisma.category.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.category.delete({ where: { id } });
  }
}
