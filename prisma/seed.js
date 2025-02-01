import prisma from "../src/lib/prisma.js"; // O alguna importación similar

const initializeCategories = async () => {
  const categories = [
    { name: "Alimentación" },
    { name: "Transporte" },
    { name: "Educación" },
    { name: "Entretenimiento" },
    { name: "Salud" },
    { name: "Vivienda" },
  ];

  try {
    const promises = categories.map(async (category) => {
      // Verificamos si la categoría ya existe antes de insertarla
      const existingCategory = await prisma.category.findUnique({
        where: { name: category.name },
      });

      if (!existingCategory) {
        // Crear una nueva categoría si no existe
        await prisma.category.create({
          data: category,
        });
        console.log(`Categoría '${category.name}' creada exitosamente.`);
      } else {
        console.log(`La categoría '${category.name}' ya existe.`);
      }
    });

    // Ejecutar todas las promesas en paralelo
    await Promise.all(promises);
  } catch (error) {
    console.error("Error al inicializar las categorías:", error);
  }
};

const main = async () => {
  await initializeCategories();
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // Desconectar siempre, aunque ocurra un error
  });
