const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      default: 'General',
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    importantNotes: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
      set(value) {
        if (value === null || value === undefined || value === '') {
          return null;
        }

        if (typeof value === 'string') {
          const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
          if (!match) {
            throw new TypeError('dueDate must be an ISO 8601 calendar date');
          }

          const date = new Date(`${value}T00:00:00.000Z`);
          if (date.toISOString().slice(0, 10) !== value) {
            throw new TypeError('dueDate must be a valid calendar date');
          }
          return date;
        }

        return value;
      },
    },
    studyDate: {
      type: Date,
      default: null,
      set(value) {
        if (value === null || value === undefined || value === '') {
          return null;
        }

        if (typeof value === 'string') {
          const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
          if (!match) {
            throw new TypeError('studyDate must be an ISO 8601 calendar date');
          }

          const date = new Date(`${value}T00:00:00.000Z`);
          if (date.toISOString().slice(0, 10) !== value) {
            throw new TypeError('studyDate must be a valid calendar date');
          }
          return date;
        }

        return value;
      },
    },
    userId: {
      type: String,
      required: true,
      default: 'default',
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.dueDate = ret.dueDate ? ret.dueDate.toISOString().slice(0, 10) : null;
        ret.studyDate = ret.studyDate ? ret.studyDate.toISOString().slice(0, 10) : null;
        delete ret._id;
        delete ret.userId;
        delete ret.archivedAt;
        return ret;
      },
    },
  },
);

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
