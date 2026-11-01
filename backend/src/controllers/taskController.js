const taskService = require('../services/taskService');

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function listTasks(req, res, next) {
  try {
    res.status(200).json(await taskService.listTasks(req.query));
  } catch (error) {
    next(error);
  }
}

async function getTask(req, res, next) {
  try {
    res.status(200).json(await taskService.getTaskById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    res.status(200).json(await taskService.updateTask(req.params.id, req.body));
  } catch (error) {
    next(error);
  }
}

async function updateTaskStatus(req, res, next) {
  try {
    res.status(200).json(
      await taskService.updateTaskStatus(req.params.id, req.body.status),
    );
  } catch (error) {
    next(error);
  }
}

async function archiveTask(req, res, next) {
  try {
    await taskService.archiveTask(req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  listTasks,
  getTask,
  updateTask,
  updateTaskStatus,
  archiveTask,
};
