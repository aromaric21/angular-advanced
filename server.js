import express from 'express';
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const app = express();
const db = new Database('/app/db/db.sqlite');
const JWT_SECRET = 'dev-secret'; // use env variable in production

// -------------------- Middleware --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// -------------------- DB Init --------------------
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    firstname TEXT,
    lastname TEXT,
    password TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS collection_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection_id INTEGER NOT NULL,
    name TEXT,
    description TEXT,
    image TEXT,
    rarity TEXT,
    price REAL,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
  )
`).run();

const exists = db.prepare('SELECT 1 FROM users WHERE username=?').get('admin');
if (!exists) {
  const hash = bcrypt.hashSync('admin1234', 10);
  db.prepare('INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)').run('admin', hash, 'Super', 'Admin');
}

// -------------------- Ensure default collection for admin --------------------
const admin = db.prepare('SELECT id FROM users WHERE username=?').get('admin');

if (admin) {
  const hasCollections = db
    .prepare('SELECT 1 FROM collections WHERE user_id=? LIMIT 1')
    .get(admin.id);

  if (!hasCollections) {
    db.prepare(
      'INSERT INTO collections (title, user_id) VALUES (?, ?)'
    ).run('Default collection', admin.id);
  }
}

// -------------------- Auth Middleware --------------------
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthenticated' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
};

// -------------------- Swagger Setup --------------------
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Collections API", version: "1.0.0", description: "JWT Auth + user-scoped Collections and Items API" },
    servers: [{ url: "http://localhost:3000" }],
    tags: [
      { name: "Auth", description: "Authentication" },
      { name: "Collection", description: "Collections management" },
      { name: "Item", description: "Collection items management" }
    ],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
      }
    },
    security: [{ BearerAuth: [] }]
  },
  apis: ["./server.js"]
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- Auth APIs --------------------
/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'invalid credentials' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

/**
 * @swagger
 * /logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user (client removes token)
 *     responses:
 *       200:
 *         description: Success
 */
app.post('/logout', (req, res) => res.json({ success: true }));

/**
 * @swagger
 * /collections:
 *   get:
 *     tags: [Collection]
 *     summary: Get all collections of the current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Array of collections with item count
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   itemsCount:
 *                     type: integer
 */
app.get('/collections', auth, (req, res) => {
  const collections = db.prepare(`
    SELECT
      c.id,
      c.title,
      COUNT(ci.id) AS itemsCount
    FROM collections c
    LEFT JOIN collection_items ci ON ci.collection_id = c.id
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY c.id
  `).all(req.userId);

  res.json(collections);
});

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *       401:
 *         description: Not authenticated
 */
app.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, username, firstname, lastname FROM users WHERE id=?').get(req.userId);
  res.json(user);
});

// -------------------- Collection APIs --------------------
/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     tags: [Collection]
 *     summary: Get a collection with items (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Collection with items and item count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 itemsCount:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Not found
 */
app.get('/collections/:id', auth, (req, res) => {
  const collection = db.prepare(`
    SELECT
      c.id,
      c.title,
      COUNT(ci.id) AS itemsCount
    FROM collections c
    LEFT JOIN collection_items ci ON ci.collection_id = c.id
    WHERE c.id = ? AND c.user_id = ?
    GROUP BY c.id
  `).get(req.params.id, req.userId);

  if (!collection) return res.sendStatus(404);

  collection.items = db
    .prepare('SELECT * FROM collection_items WHERE collection_id=?')
    .all(collection.id);

  res.json(collection);
});

/**
 * @swagger
 * /collections:
 *   post:
 *     tags: [Collection]
 *     summary: Create a collection
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Created collection
 */
app.post('/collections', auth, (req, res) => {
  const result = db.prepare('INSERT INTO collections (title, user_id) VALUES (?, ?)').run(req.body.title, req.userId);
  res.json({ id: result.lastInsertRowid, title: req.body.title, items: [] });
});

/**
 * @swagger
 * /collections/{id}:
 *   put:
 *     tags: [Collection]
 *     summary: Update a collection (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       204:
 *         description: No content
 */
app.put('/collections/:id', auth, (req, res) => {
  const result = db.prepare('UPDATE collections SET title=? WHERE id=? AND user_id=?').run(req.body.title, req.params.id, req.userId);
  if (result.changes === 0) return res.sendStatus(404);
  res.sendStatus(204);
});

/**
 * @swagger
 * /collections/{id}:
 *   patch:
 *     tags: [Collection]
 *     summary: Partially update a collection (owned by current user)
 *     description: Updates only the provided fields of a collection.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Collection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Collection not found or not owned
 */
app.patch('/collections/:id', auth, (req, res) => {
  const fields = [];
  const params = { id: req.params.id, userId: req.userId };

  if (req.body.title !== undefined) {
    fields.push('title=@title');
    params.title = req.body.title;
  }

  if (fields.length === 0) return res.sendStatus(204);

  const result = db.prepare(`
    UPDATE collections
    SET ${fields.join(', ')}
    WHERE id=@id AND user_id=@userId
  `).run(params);

  if (result.changes === 0) return res.sendStatus(404);
  res.sendStatus(204);
});

/**
 * @swagger
 * /collections/{id}:
 *   delete:
 *     tags: [Collection]
 *     summary: Delete a collection (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: No content
 */
app.delete('/collections/:id', auth, (req, res) => {
  const result = db.prepare('DELETE FROM collections WHERE id=? AND user_id=?').run(req.params.id, req.userId);
  if (result.changes === 0) return res.sendStatus(404);
  res.sendStatus(204);
});

// -------------------- Item APIs --------------------

/**
 * @swagger
 * /items:
 *   get:
 *     tags: [Item]
 *     summary: Get all items for a collection (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: collectionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Collection ID
 *     responses:
 *       200:
 *         description: Array of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   collectionId:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   image:
 *                     type: string
 *                   rarity:
 *                     type: string
 *                   price:
 *                     type: number
 *       404:
 *         description: Collection not found
 */
app.get('/items', auth, (req, res) => {
  const collectionId = req.query.collectionId;
  if (!collectionId) return res.status(400).json({ error: 'collectionId is required' });

  const collection = db.prepare('SELECT id FROM collections WHERE id=? AND user_id=?').get(collectionId, req.userId);
  if (!collection) return res.sendStatus(404);

  const items = db.prepare('SELECT * FROM collection_items WHERE collection_id=?').all(collection.id);
  res.json(items);
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     tags: [Item]
 *     summary: Get a single item (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 collectionId:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 image:
 *                   type: string
 *                 rarity:
 *                   type: string
 *                 price:
 *                   type: number
 *       404:
 *         description: Item not found
 */
app.get('/items/:id', auth, (req, res) => {
  const item = db.prepare(`
    SELECT 
      ci.*,
      ci.collection_id AS collectionId
    FROM collection_items ci
    JOIN collections c ON c.id = ci.collection_id
    WHERE ci.id = ? AND c.user_id = ?
  `).get(req.params.id, req.userId);

  if (!item) return res.sendStatus(404);

  res.json(item);
});

/**
 * @swagger
 * /items:
 *   post:
 *     tags: [Item]
 *     summary: Create a new item in a collection (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collectionId
 *               - name
 *             properties:
 *               collectionId:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               rarity:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Created item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 */
app.post('/items', auth, (req, res) => {
  const { collectionId, name, description, image, rarity, price } = req.body;
  if (!collectionId || !name) return res.status(400).json({ error: 'collection_id and name are required' });

  const collection = db.prepare('SELECT id FROM collections WHERE id=? AND user_id=?').get(collectionId, req.userId);
  if (!collection) return res.sendStatus(404);

  const result = db.prepare(`
    INSERT INTO collection_items (collection_id, name, description, image, rarity, price)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(collection.id, name, description, image, rarity, price);

  res.json({ id: result.lastInsertRowid });
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     tags: [Item]
 *     summary: Replace an item completely (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               rarity:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Item not found or not owned
 */
app.put('/items/:id', auth, (req, res) => {
  const item = db.prepare(`
    SELECT ci.id
    FROM collection_items ci
    JOIN collections c ON c.id = ci.collection_id
    WHERE ci.id=? AND c.user_id=?
  `).get(req.params.id, req.userId);

  if (!item) return res.sendStatus(404);

  const { name, description, image, rarity, price } = req.body;
  db.prepare(`
    UPDATE collection_items
    SET name=?, description=?, image=?, rarity=?, price=?
    WHERE id=?
  `).run(name, description, image, rarity, price, req.params.id);

  res.sendStatus(204);
});

/**
 * @swagger
 * /items/{id}:
 *   patch:
 *     tags: [Item]
 *     summary: Update some fields of an item (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               rarity:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Item not found or not owned
 */
app.patch('/items/:id', auth, (req, res) => {
  const item = db.prepare(`
    SELECT ci.id
    FROM collection_items ci
    JOIN collections c ON c.id = ci.collection_id
    WHERE ci.id=? AND c.user_id=?
  `).get(req.params.id, req.userId);

  if (!item) return res.sendStatus(404);

  const fields = ['name', 'description', 'image', 'rarity', 'price'];
  const updates = fields.filter(f => req.body[f] !== undefined).map(f => `${f}=@${f}`).join(', ');
  if (!updates) return res.sendStatus(204); // nothing to update

  const stmt = db.prepare(`UPDATE collection_items SET ${updates} WHERE id=@id`);
  stmt.run({ id: req.params.id, ...req.body });

  res.sendStatus(204);
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     tags: [Item]
 *     summary: Delete an item (owned by current user)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       204:
 *         description: No content
 *       404:
 *         description: Item not found or not owned
 */
app.delete('/items/:id', auth, (req, res) => {
  const result = db.prepare(`
    DELETE FROM collection_items
    WHERE id IN (
      SELECT ci.id
      FROM collection_items ci
      JOIN collections c ON c.id = ci.collection_id
      WHERE ci.id=? AND c.user_id=?
    )
  `).run(req.params.id, req.userId);

  if (result.changes === 0) return res.sendStatus(404);
  res.sendStatus(204);
});

// -------------------- Start --------------------
app.listen(3000, () => { console.log('Backend running on http://localhost:3000'); });