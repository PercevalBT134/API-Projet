import express from "express";
 
const app = express();
const port = 3000;
app.use(express.json());
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/auth.js";
import { authenticateRefreshToken } from "./middleware/authrefresh.js";
import { authorizeRoles } from "./middleware/roles.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library API',
      version: '1.0.0',
      description: 'API de gestion de livres avec Express, Prisma et PostgreSQL'
    },
    servers: [
      {
        url: 'https://api-projet-qd2e.onrender.com//api/v1'
      }
    ]
  },
  apis: ['./app.js'] // <-- où Swagger va chercher les commentaires de routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Gestion des livres
 */

/**
 * @swagger
 * tags:
 *   name: Authors
 *   description: Gestion des livres
 */

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Récupère un livre par son ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du livre à récupérer
 *     responses:
 *       200:
 *         description: Livre trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 authorId:
 *                   type: integer
 *                 categoryId:
 *                   type: integer
 *                 publishedDate:
 *                   type: string
 *                   format: date
 *                 available:
 *                   type: boolean
 *       404:
 *         description: Livre introuvable
 */
app.get('/api/v1/books/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const book = await prisma.book.findUnique({
      where: { id }
    });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Récupère tous les livres
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Liste des livres
 */
app.get('/api/v1/books', authenticateToken, async (req, res) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Ajoute un nouveau livre
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               authorId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               available:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Livre ajouté avec succès
 */
app.post('/api/v1/books', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { title, description, authorId, categoryId, publishedDate, available } = req.body;

  try {
    const newBook = await prisma.book.create({
      data: {
        title,
        description,
        authorId,
        categoryId,
        publishedDate: new Date(publishedDate),
        available
      }
    });

    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Met à jour un livre existant
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du livre à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               authorId:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               publishedDate:
 *                 type: string
 *                 format: date
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Livre mis à jour avec succès
 *       404:
 *         description: Livre introuvable
 */
app.put('/api/v1/books/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  try {
    const updatedBook = await prisma.book.update({
      where: { id },
      data
    });

    res.json(updatedBook);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Supprime un livre par son ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du livre à supprimer
 *     responses:
 *       200:
 *         description: Livre supprimé avec succès
 *       404:
 *         description: Livre introuvable
 */
app.delete('/api/v1/books/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.book.delete({
      where: { id }
    });

    res.json({ message: 'Livre supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Récupère un auteur par son ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'auteur à récupérer
 *     responses:
 *       200:
 *         description: Auteur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 biography:
 *                   type: string
 *                 birthdate:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Auteur introuvable
 */
app.get('/api/v1/authors/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const author = await prisma.author.findUnique({
      where: { id }
    });

    if (!author) {
      return res.status(404).json({ message: 'Auteur non trouvé' });
    }

    res.json(author);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Récupère tous les auteurs
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: Liste des auteurs
 */
app.get('/api/v1/authors', authenticateToken, async (req, res) => {
  try {
    const authors = await prisma.author.findMany();
    res.json(authors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Ajoute un nouveau auteur
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 biography:
 *                   type: string
 *                 birthdate:
 *                   type: string
 *                   format: date
 *     responses:
 *       201:
 *         description: Auteur ajouté avec succès
 */
app.post('/api/v1/authors', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { name, biography, birthdate } = req.body;

  try {
    const newAuthor = await prisma.author.create({
      data: {
        name,
        biography,
        birthdate: new Date(birthdate)
      }
    });

    res.status(201).json(newAuthor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Met à jour un auteur existant
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'auteur à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 biography:
 *                   type: string
 *                 birthdate:
 *                   type: string
 *                   format: date
 *     responses:
 *       200:
 *         description: Auteur mis à jour avec succès
 *       404:
 *         description: Auteur introuvable
 */
app.put('/api/v1/authors/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  try {
    const updatedAuthor = await prisma.author.update({
      where: { id },
      data
    });

    res.json(updatedAuthor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Supprime un auteur par son ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'auteur à supprimer
 *     responses:
 *       200:
 *         description: Auteur supprimé avec succès
 *       404:
 *         description: Auteur introuvable
 */
app.delete('/api/v1/authors/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.author.delete({
      where: { id }
    });

    res.json({ message: 'Auteur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Récupère tous les catégories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Liste des catégories
 */
app.get('/api/v1/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la catégorie à récupérer
 *     responses:
 *       200:
 *         description: Catégorie trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *       404:
 *         description: Catégorie introuvable
 */
app.get('/api/v1/categories/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvé' });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Ajoute une nouvelle catégorie
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *     responses:
 *       201:
 *         description: Catégorie ajouté avec succès
 */
app.post('/api/v1/categories', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { name } = req.body;

  try {
    const newCategory = await prisma.category.create({
      data: {
        name
      }
    });

    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Met à jour un catégorie existant
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la catégorie à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *     responses:
 *       200:
 *         description: Catégorie mis à jour avec succès
 *       404:
 *         description: Catégorie introuvable
 */
app.put('/api/v1/categories/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const id = parseInt(req.params.id);
  const data = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data
    });

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Supprime une catégorie par son ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la catégorie à supprimer
 *     responses:
 *       200:
 *         description: Catégorie supprimé avec succès
 *       404:
 *         description: Catégorie introuvable
 */
app.delete('/api/v1/categories/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.category.delete({
      where: { id }
    });

    res.json({ message: 'Catégorie supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/auth/register', async (req, res) => {
    let { email, password } = req.body;
    const role = 'user';
    password = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password,
        role
      }
    });

    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Vérifier si l'utilisateur existe
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
      return res.status(400).json({ message: "Utilisateur introuvable" });
  }

  // Vérifier le mot de passe
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
  }

  const accessToken = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
  );

  const refreshToken = jwt.sign(
      { userId: user.id, role: user.role }, 
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
  );

  return res.json({
      message: "Connexion réussie",
      accessToken
  });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/auth/refresh', authenticateRefreshToken, async (req, res) => {
  try {
  // Génère un nouveau access token
  const newAccessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});