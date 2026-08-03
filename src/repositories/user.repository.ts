import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, type NewUser, type User } from "../db/schema.js";

export class UserRepository {
  async findAll(): Promise<User[]> {
    return db.select().from(users);
  }

  async findById(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async create(data: NewUser): Promise<User> {
    const [created] = await db.insert(users).values(data).returning();
    return created;
  }
}
