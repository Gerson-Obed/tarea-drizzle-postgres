import { TaskRepository } from "../repositories/task.repository.js";
import { UserRepository } from "../repositories/user.repository.js";
import type { NewTask, Task } from "../db/schema.js";
import type { CreateTaskInput, UpdateTaskInput } from "../package/contracts/task.contract.js";

export class NotFoundError extends Error {}

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

  async listPaginated(page: number, limit: number) {
    const [data, total] = await Promise.all([
      this.taskRepository.findAll(limit, (page - 1) * limit),
      this.taskRepository.countAll(),
    ]);
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async getById(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) throw new NotFoundError(`La tarea ${id} no existe`);
    return task;
  }

  async listByUser(userId: number): Promise<Task[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`El usuario ${userId} no existe`);
    }
    return this.taskRepository.findByUser(userId);
  }

  async createTask(data: NewTask | CreateTaskInput): Promise<Task> {
    const user = await this.userRepository.findById(data.userId);
    if (!user) throw new NotFoundError(`El usuario ${data.userId} no existe`);
    return this.taskRepository.create(data);
  }

  async updateTask(id: number, data: UpdateTaskInput): Promise<Task> {
    await this.getById(id);
    if (data.userId !== undefined) {
      const user = await this.userRepository.findById(data.userId);
      if (!user) throw new NotFoundError(`El usuario ${data.userId} no existe`);
    }
    const updated = await this.taskRepository.update(id, data);
    return updated!;
  }

  async completeTask(id: number): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`La tarea ${id} no existe`);
    }
    const updated = await this.taskRepository.markCompleted(id);
    return updated!;
  }

  async removeTask(id: number): Promise<void> {
    const deleted = await this.taskRepository.delete(id);
    if (!deleted) throw new NotFoundError(`La tarea ${id} no existe`);
  }
}
