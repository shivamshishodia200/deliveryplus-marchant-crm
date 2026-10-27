import { Task } from '../../models/Task.js';
import { Notification } from '../../models/Notification.js';
import { logAuditEvent } from '../../middleware/audit.middleware.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, assignedTo, dueToday } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (req.user.role === 'sales_rep') {
      query.assignedTo = req.user._id;
    }

    if (dueToday === 'true') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      data: tasks,
      meta: { total: tasks.length }
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      assignedTo: req.body.assignedTo || req.user._id
    };

    const task = await Task.create(taskData);

    // Notify assigned user if different from creator
    if (String(task.assignedTo) !== String(req.user._id)) {
      await Notification.create({
        recipient: task.assignedTo,
        title: 'New Task Assigned',
        message: `You were assigned: "${task.title}"`,
        type: 'task_due',
        link: '/tasks'
      });
    }

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    if (req.body.status === 'completed' && task.status !== 'completed') {
      task.completedAt = new Date();
    }

    Object.assign(task, req.body);
    await task.save();

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Task not found' }
      });
    }

    res.status(200).json({
      success: true,
      data: { message: 'Task deleted successfully' }
    });
  } catch (error) {
    next(error);
  }
};
