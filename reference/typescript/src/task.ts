import { nanoid } from 'nanoid';
import type { 
  Task, 
  TaskCreateRequest, 
  TaskUpdate, 
  SNAPMessage,
  AgentID,
  JSONRPCRequest,
  JSONRPCResponse
} from './types.js';
import { TaskSchema, TaskCreateRequestSchema, TaskUpdateSchema, TaskStatus } from './types.js';

/**
 * Generate a unique task ID
 */
export function generateTaskId(): string {
  return `task_${nanoid()}`;
}

/**
 * Task builder for creating task requests
 */
export class TaskBuilder {
  private request: Partial<TaskCreateRequest>;

  constructor(message: SNAPMessage) {
    this.request = {
      message,
      priority: 'normal'
    };
  }

  /**
   * Set callback URL for status updates
   */
  callback(url: string): this {
    this.request.callback = url;
    return this;
  }

  /**
   * Set task timeout in seconds
   */
  timeout(seconds: number): this {
    this.request.timeout = seconds;
    return this;
  }

  /**
   * Set task priority
   */
  priority(priority: 'low' | 'normal' | 'high'): this {
    this.request.priority = priority;
    return this;
  }

  /**
   * Add metadata
   */
  metadata(metadata: Record<string, any>): this {
    this.request.metadata = { ...this.request.metadata, ...metadata };
    return this;
  }

  /**
   * Build the task creation request
   */
  build(): TaskCreateRequest {
    return TaskCreateRequestSchema.parse(this.request);
  }

  /**
   * Build as JSON-RPC request
   */
  buildRPC(id?: string): JSONRPCRequest {
    return {
      jsonrpc: '2.0',
      method: 'task/create',
      params: this.build(),
      id: id || nanoid()
    };
  }
}

/**
 * Task manager for creating and updating tasks
 */
export class TaskManager {
  /**
   * Create a new task
   */
  static create(message: SNAPMessage): TaskBuilder {
    return new TaskBuilder(message);
  }

  /**
   * Create a task instance
   */
  static createTask(
    request: TaskCreateRequest, 
    agentId: AgentID
  ): Task {
    const now = new Date().toISOString();
    
    return {
      id: generateTaskId(),
      status: TaskStatus.QUEUED,
      createdAt: now,
      updatedAt: now,
      metadata: {
        ...request.metadata,
        agentId: agentId.id,
        priority: request.priority,
        ...(request.timeout && { timeout: request.timeout }),
        ...(request.callback && { callback: request.callback })
      }
    };
  }

  /**
   * Update task status
   */
  static updateTask(task: Task, update: TaskUpdate): Task {
    const updatedTask = {
      ...task,
      ...update,
      updatedAt: new Date().toISOString()
    };

    return TaskSchema.parse(updatedTask);
  }

  /**
   * Mark task as processing
   */
  static startProcessing(
    task: Task, 
    message?: string, 
    estimatedCompletion?: string
  ): Task {
    return this.updateTask(task, {
      status: TaskStatus.PROCESSING,
      progress: 0,
      message,
      estimatedCompletion
    });
  }

  /**
   * Update task progress
   */
  static updateProgress(
    task: Task, 
    progress: number, 
    message?: string
  ): Task {
    return this.updateTask(task, {
      progress: Math.max(0, Math.min(1, progress)),
      message
    });
  }

  /**
   * Complete task with result
   */
  static complete(task: Task, result: SNAPMessage): Task {
    return this.updateTask(task, {
      status: TaskStatus.COMPLETED,
      progress: 1,
      result,
      message: 'Task completed successfully'
    });
  }

  /**
   * Fail task with error
   */
  static fail(task: Task, error: string): Task {
    return this.updateTask(task, {
      status: TaskStatus.FAILED,
      error,
      message: 'Task failed'
    });
  }

  /**
   * Cancel task
   */
  static cancel(task: Task, reason?: string): Task {
    return this.updateTask(task, {
      status: TaskStatus.CANCELLED,
      message: reason || 'Task cancelled',
      error: reason
    });
  }

  /**
   * Check if task is active (can be updated)
   */
  static isActive(task: Task): boolean {
    return task.status === TaskStatus.QUEUED || task.status === TaskStatus.PROCESSING;
  }

  /**
   * Check if task is completed (successfully or not)
   */
  static isCompleted(task: Task): boolean {
    return [TaskStatus.COMPLETED, TaskStatus.FAILED, TaskStatus.CANCELLED].includes(task.status);
  }

  /**
   * Check if task is expired based on timeout
   */
  static isExpired(task: Task): boolean {
    const timeout = task.metadata?.timeout;
    if (!timeout) return false;

    const createdAt = new Date(task.createdAt).getTime();
    const now = Date.now();
    const elapsedSeconds = (now - createdAt) / 1000;

    return elapsedSeconds > timeout;
  }

  /**
   * Get task duration in seconds
   */
  static getDuration(task: Task): number {
    const createdAt = new Date(task.createdAt).getTime();
    const endTime = this.isCompleted(task) 
      ? new Date(task.updatedAt).getTime()
      : Date.now();
    
    return (endTime - createdAt) / 1000;
  }

  /**
   * Estimate completion time based on progress
   */
  static estimateCompletion(task: Task): string | null {
    if (!task.progress || task.progress === 0) return null;
    
    const duration = this.getDuration(task);
    const estimatedTotal = duration / task.progress;
    const remainingTime = estimatedTotal - duration;
    
    const completionTime = new Date(Date.now() + remainingTime * 1000);
    return completionTime.toISOString();
  }
}

/**
 * Task utilities
 */
export class TaskUtils {
  /**
   * Create JSON-RPC request to get task status
   */
  static getStatusRequest(taskId: string, rpcId?: string): JSONRPCRequest {
    return {
      jsonrpc: '2.0',
      method: 'task/status',
      params: { taskId },
      id: rpcId || nanoid()
    };
  }

  /**
   * Create JSON-RPC request to cancel task
   */
  static cancelRequest(taskId: string, reason?: string, rpcId?: string): JSONRPCRequest {
    return {
      jsonrpc: '2.0',
      method: 'task/cancel',
      params: { 
        taskId,
        ...(reason && { reason })
      },
      id: rpcId || nanoid()
    };
  }

  /**
   * Create JSON-RPC request to list tasks
   */
  static listRequest(
    filters?: {
      status?: TaskStatus;
      limit?: number;
      offset?: number;
    },
    rpcId?: string
  ): JSONRPCRequest {
    return {
      jsonrpc: '2.0',
      method: 'task/list',
      params: filters || {},
      id: rpcId || nanoid()
    };
  }

  /**
   * Create task status update notification
   */
  static createStatusUpdate(task: Task): JSONRPCRequest {
    return {
      jsonrpc: '2.0',
      method: 'task/update',
      params: {
        taskId: task.id,
        status: task.status,
        progress: task.progress,
        message: task.message,
        updatedAt: task.updatedAt,
        ...(task.result && { result: task.result }),
        ...(task.error && { error: task.error })
      },
      id: nanoid()
    };
  }

  /**
   * Validate task object
   */
  static validate(task: any): Task {
    return TaskSchema.parse(task);
  }

  /**
   * Filter tasks by status
   */
  static filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
    return tasks.filter(task => task.status === status);
  }

  /**
   * Sort tasks by creation date
   */
  static sortByCreatedAt(tasks: Task[], descending = true): Task[] {
    return tasks.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return descending ? bTime - aTime : aTime - bTime;
    });
  }

  /**
   * Get task summary statistics
   */
  static getStats(tasks: Task[]): {
    total: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageDuration: number;
  } {
    const stats = {
      total: tasks.length,
      queued: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      averageDuration: 0
    };

    let totalDuration = 0;
    let completedCount = 0;

    for (const task of tasks) {
      stats[task.status]++;
      
      if (TaskManager.isCompleted(task)) {
        totalDuration += TaskManager.getDuration(task);
        completedCount++;
      }
    }

    stats.averageDuration = completedCount > 0 ? totalDuration / completedCount : 0;
    
    return stats;
  }
}

/**
 * Convenience function to create a task
 */
export function createTask(message: SNAPMessage): TaskBuilder {
  return TaskManager.create(message);
}