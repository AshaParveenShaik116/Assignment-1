const mongoose = require('mongoose');
const Task = require('../models/Task');
const { AppError } = require('../utils/errors');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toTaskDto(task) {
  const value = typeof task.toObject === 'function' ? task.toObject() : task;
  return {
    id: value._id.toString(),
    subject: value.subject || 'General',
    title: value.title,
    description: value.description,
    importantNotes: value.importantNotes ?? '',
    status: value.status,
    priority: value.priority,
    dueDate: value.dueDate ? new Date(value.dueDate).toISOString().slice(0, 10) : null,
    studyDate: value.studyDate ? new Date(value.studyDate).toISOString().slice(0, 10) : null,
    createdAt: new Date(value.createdAt).toISOString(),
    updatedAt: new Date(value.updatedAt).toISOString(),
  };
}

function toValidationError(error) {
  if (error instanceof mongoose.Error.ValidationError || error.name === 'CastError') {
    const details = error.errors
      ? Object.values(error.errors).map((fieldError) => `${fieldError.path}: ${fieldError.message}`)
      : [error.message];
    return new AppError('Task data is invalid', 400, 'VALIDATION_ERROR', details);
  }
  return error;
}

async function createTask(input) {
  try {
    const task = await Task.create(input);
    return toTaskDto(task);
  } catch (error) {
    throw toValidationError(error);
  }
}

async function listTasks(filters = {}) {
  const query = { archivedAt: null };
  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.subject) query.subject = new RegExp(`^${escapeRegex(filters.subject)}$`, 'i');
  if (filters.search) {
    const search = new RegExp(escapeRegex(filters.search), 'i');
    query.$or = [
      { subject: search },
      { title: search },
      { description: search },
      { importantNotes: search },
    ];
  }

  if (filters.studyAfter || filters.studyBefore) {
    query.studyDate = {};
    if (filters.studyAfter) query.studyDate.$gte = new Date(`${filters.studyAfter}T00:00:00.000Z`);
    if (filters.studyBefore) query.studyDate.$lte = new Date(`${filters.studyBefore}T00:00:00.000Z`);
  }

  if (filters.dueAfter || filters.dueBefore) {
    query.dueDate = {};
    if (filters.dueAfter) query.dueDate.$gte = new Date(`${filters.dueAfter}T00:00:00.000Z`);
    if (filters.dueBefore) query.dueDate.$lte = new Date(`${filters.dueBefore}T00:00:00.000Z`);
  }

  const tasks = await Task.find(query)
    .sort({ studyDate: 1, dueDate: 1, createdAt: -1, _id: 1 })
    .exec();
  return tasks.map(toTaskDto);
}

async function getTaskById(id) {
  const task = await Task.findOne({ _id: id, archivedAt: null }).exec();
  if (!task) {
    throw new AppError('Task not found', 404, 'NOT_FOUND');
  }
  return toTaskDto(task);
}

async function updateTask(id, input) {
  try {
    const update = { ...input };
    const task = await Task.findOneAndUpdate(
      { _id: id, archivedAt: null },
      { $set: update },
      { new: true, runValidators: true, context: 'query' },
    ).exec();
    if (!task) throw new AppError('Task not found', 404, 'NOT_FOUND');
    return toTaskDto(task);
  } catch (error) {
    throw toValidationError(error);
  }
}

async function updateTaskStatus(id, status) {
  return updateTask(id, { status });
}

async function archiveTask(id) {
  const task = await Task.findOneAndUpdate(
    { _id: id, archivedAt: null },
    { $set: { archivedAt: new Date() } },
    { new: true },
  ).exec();
  if (!task) throw new AppError('Task not found', 404, 'NOT_FOUND');
}

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  archiveTask,
};
