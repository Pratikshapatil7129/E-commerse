import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { User, Product, Order } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Interface for the raw database JSON content
interface DbSchema {
  users: (User & { passwordHash: string; salt: string })[];
  products: Product[];
  orders: Order[];
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-dripper',
    name: 'Ceramic Pour-Over Dripper',
    description: 'A handcrafted, double-walled ceramic dripper designed for slow, temperature-stable filter brewing. Features interior spiral ribs to optimize water flow and extract a clean, vibrant cup of coffee.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    category: 'Kitchen',
    stock: 15,
    rating: 4.8,
    reviewsCount: 42,
    specs: ['Handcrafted Matte Ceramic', 'Temperature-stable structure', 'Dishwasher safe', 'Fits standard V60-02 filters']
  },
  {
    id: 'prod-organizer',
    name: 'Minimalist Desk Organizer',
    description: 'Exquisitely carved from premium solid white oak, this desktop dock features magnetic modular slots. Includes three aluminum storage cups lined with soft charcoal wool felt to secure your pens, keys, and accessories.',
    price: 48.00,
    image: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?q=80&w=600&auto=format&fit=crop',
    category: 'Office',
    stock: 8,
    rating: 4.6,
    reviewsCount: 19,
    specs: ['Solid sustainably sourced white oak', 'Magnetic base connections', 'Lined with Merino felt', 'Precision milled slots']
  },
  {
    id: 'prod-deskmat',
    name: 'Full-Grain Leather Desk Mat',
    description: 'Elevate your workspace with a smooth, protective desk surface crafted from water-resistant black full-grain leather. Designed to facilitate flawless mouse traction while shielding your desktop from scratches.',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1632292224971-0d45778b3002?q=80&w=600&auto=format&fit=crop',
    category: 'Office',
    stock: 10,
    rating: 4.9,
    reviewsCount: 56,
    specs: ['100% Full grain eco-tanned leather', 'Flawless optical mouse tracking', '90cm x 40cm optimal size', 'Non-slip suede backing']
  },
  {
    id: 'prod-sleeve',
    name: 'Merino Wool Felt Laptop Sleeve',
    description: 'A plush, thick sleeve tailored specifically for 14-inch laptops. Crafted from premium grey Merino wool felt to insulate your device from impacts and scuffs, accented with a premium tan leather closing tab.',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=600&auto=format&fit=crop',
    category: 'Lifestyle',
    stock: 12,
    rating: 4.7,
    reviewsCount: 28,
    specs: ['100% Merino wool felt construction', 'Premium full grain leather pull tab', 'Integrated rear notebook pocket', 'Snug, form-fitting design']
  },
  {
    id: 'prod-candle',
    name: 'Amber Glass Sandalwood Candle',
    description: 'Bring warmth into your space with this hand-poured soy wax candle. Infused with natural essential oils of aged sandalwood, cedar, and vetiver, encased inside a warm apothecary amber glass jar.',
    price: 24.00,
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop',
    category: 'Lifestyle',
    stock: 25,
    rating: 4.5,
    reviewsCount: 84,
    specs: ['All-natural domestic soy wax', 'Infused with custom essential oils', 'Amber apothecary jar with lid', '40 to 45 hours burn time']
  },
  {
    id: 'prod-clock',
    name: 'Beechwood Analog Clock',
    description: 'A striking desktop timepiece carved out of a single block of mature, sustainably harvested beechwood. Implements a high-torque sweeping mechanism for completely silent, non-ticking operational flow.',
    price: 42.00,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop',
    category: 'Lifestyle',
    stock: 5,
    rating: 4.4,
    reviewsCount: 15,
    specs: ['Single block beechwood body', 'Completely silent sweeping motion', 'Warm minimalist watchface', 'Runs on one standard AA battery']
  },
  {
    id: 'prod-pen',
    name: 'Matte Brass Gel Pen',
    description: 'Meticulously balanced and machined from solid raw hex brass, this gel pen has an elegant weight that prevents hand fatigue. Uncapped design with standard refillable Schmidt gel roller ball cartridges.',
    price: 20.00,
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop',
    category: 'Office',
    stock: 30,
    rating: 4.7,
    reviewsCount: 31,
    specs: ['Uncoated raw machined brass', 'Schmidt fine-line gel refill (Black)', 'Optimized weight balance', 'Patina finishes naturally over time']
  },
  {
    id: 'prod-throw',
    name: 'Organic Stonewashed Linen Throw',
    description: 'A luxuriously heavy throw blanket crafted from 100% fine French flax linen, stonewashed for ultimate softness. The earthy sandstone tone coordinates effortlessly with modern bedroom, sofa, or armchair configurations.',
    price: 85.00,
    image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=600&auto=format&fit=crop',
    category: 'Kitchen',
    stock: 6,
    rating: 4.9,
    reviewsCount: 22,
    specs: ['100% organic stonewashed French flax', 'Naturally breathable and hypoallergenic', '150cm x 200cm coverage', 'Finished with delicate fringed trim']
  }
];

export class Database {
  private static async read(): Promise<DbSchema> {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      const dbObj = JSON.parse(data) as DbSchema;
      // Ensure all top level keys exist
      if (!dbObj.users) dbObj.users = [];
      if (!dbObj.products || dbObj.products.length === 0) dbObj.products = INITIAL_PRODUCTS;
      if (!dbObj.orders) dbObj.orders = [];
      return dbObj;
    } catch {
      // Create fresh DB
      const freshDb: DbSchema = {
        users: [],
        products: INITIAL_PRODUCTS,
        orders: [],
      };
      await this.write(freshDb);
      return freshDb;
    }
  }

  private static async write(db: DbSchema): Promise<void> {
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  // --- Auth operations ---
  public static async registerUser(email: string, passwordPlain: string, name: string): Promise<User> {
    const db = await this.read();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const exists = db.users.some(u => u.email === normalizedEmail);
    if (exists) {
      throw new Error('User with this email already exists.');
    }

    // Hash the password securely with built-in crypto
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(passwordPlain, salt, 1000, 64, 'sha512').toString('hex');

    const newUser: User & { passwordHash: string; salt: string } = {
      id: `usr-${crypto.randomUUID()}`,
      email: normalizedEmail,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt: salt,
    };

    db.users.push(newUser);
    await this.write(db);

    const { passwordHash, salt: s, ...userResult } = newUser;
    return userResult;
  }

  public static async loginUser(email: string, passwordPlain: string): Promise<User> {
    const db = await this.read();
    const normalizedEmail = email.trim().toLowerCase();

    const user = db.users.find(u => u.email === normalizedEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    // Verify password hash
    const checkHash = crypto.pbkdf2Sync(passwordPlain, user.salt, 1000, 64, 'sha512').toString('hex');
    if (checkHash !== user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const { passwordHash, salt, ...userResult } = user;
    return userResult;
  }

  // --- Products operations ---
  public static async getProducts(): Promise<Product[]> {
    const db = await this.read();
    return db.products;
  }

  public static async getProductById(id: string): Promise<Product | null> {
    const db = await this.read();
    return db.products.find(p => p.id === id) || null;
  }

  // --- Orders operations ---
  public static async createOrder(
    userId: string,
    items: { productId: string; quantity: number }[],
    shippingAddress: Order['shippingAddress'],
    paymentMethod: string
  ): Promise<Order> {
    const db = await this.read();

    const orderItems: Order['items'] = [];
    let totalPrice = 0;

    // Check products stock & fetch data
    for (const item of items) {
      const prod = db.products.find(p => p.id === item.productId);
      if (!prod) {
        throw new Error(`Product ${item.productId} not found.`);
      }
      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${prod.name}". Available: ${prod.stock}`);
      }

      // Decrement stock
      prod.stock -= item.quantity;
      totalPrice += prod.price * item.quantity;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        productImage: prod.image,
        price: prod.price,
        quantity: item.quantity,
      });
    }

    const newOrder: Order = {
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      userId,
      items: orderItems,
      total: totalPrice,
      shippingAddress,
      paymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    db.orders.push(newOrder);
    await this.write(db);

    return newOrder;
  }

  public static async getOrdersByUser(userId: string): Promise<Order[]> {
    const db = await this.read();
    const userOrders = db.orders.filter(o => o.userId === userId);
    // Sort from newest to oldest
    return userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
