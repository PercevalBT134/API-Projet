const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
 const data = require('./data.json'); // charge l'objet entier
const books = data.books; // ici, books est un tableau

for (const book of books) {
  await prisma.book.create({ data: {
    title: book.title,
    description: book.description,
    authorId: book.authorId,
    categoryId: book.categoryId,
    publishedDate: new Date(book.publishedDate),
    available: book.available
  }});
}

  console.log('Import terminé !');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });