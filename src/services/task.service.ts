import { TaskRepository } from "../repositories/task.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { NewTask, Task } from "../db/schema.js";

/**
 * Capa de servicio: contiene la lógica de negocio y se apoya en el
 * repositorio para leer/escribir datos. El servicio no sabe nada de SQL.
 */
export class TaskService {
  constructor(
    private readonly taskRepository: TaskRepository = new TaskRepository(),
    private readonly userRepository: UserRepository = new UserRepository()
  ) {}

  async listAll(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async listByUser(userId: number): Promise<Task[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`El usuario ${userId} no existe`);
    }
    return this.taskRepository.findByUser(userId);
  }

  async createTask(data: NewTask): Promise<Task> {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("El título de la tarea es obligatorio");
    }
    return this.taskRepository.create(data);
  }

  async completeTask(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error(`La tarea ${id} no existe`);
    }
    const updated = await this.taskRepository.markCompleted(id);
    return updated!;
  }

  async removeTask(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
