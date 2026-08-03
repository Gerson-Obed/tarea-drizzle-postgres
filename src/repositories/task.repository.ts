import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasks, type NewTask, type Task } from "../db/schema.js";

/**
 * Capa de acceso a datos: solo sabe hablar con la base de datos.
 * No contiene lógica de negocio.
 */
export class TaskRepository {
  async findAll(): Promise<Task[]> {
    return db.select().from(tasks);
  }

  async findById(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async findByUser(userId: number): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async create(data: NewTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(data).returning();
    return created;
  }

  async markCompleted(id: number): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ completed: true })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async delete(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }
}
