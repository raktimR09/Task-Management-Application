import mongoose, { Schema } from "mongoose";

// Subtask Schema
// Subtask Schema (updated with activities)
const subTaskSchema = new Schema(
  {
    title: { type: String, required: true },
    tag: String,
    date: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      default: Date.now,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "medium", "high"],
      default: "low",
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    stage: {
      type: String,
      enum: ["todo", "in progress", "completed", "overdue"],
      default: "todo",
    },
    activities: [
      {
        type: {
          type: String,
          default: "assigned",
          enum: [
            "assigned",
            "started",
            "in progress",
            "bug",
            "completed",
            "commented",
          ],
        },
        activity: String,
        by: { type: Schema.Types.ObjectId, ref: "User" },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    _id: true,
  }
);


// Task Schema
const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    deadline: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed", "overdue"],
    },
    subTasks: [subTaskSchema],
    documents: [
      {
        name: { type: String, required: true },
        path: { type: String, required: true },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Dynamic Priority for Task
taskSchema.virtual("priority").get(function () {
  if (!this.deadline) return "normal";

  const now = new Date();
  const diffInMs = this.deadline - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 2) return "high";
  if (diffInDays <= 7) return "medium";
  if (diffInDays <= 15) return "normal";
  return "low";
});

// Effective Stage for Task (Overdue)
taskSchema.virtual("effectiveStage").get(function () {
  const now = new Date();
  if (this.stage !== "completed" && this.deadline < now) {
    return "overdue";
  }
  return this.stage;
});

// Is Task Locked
taskSchema.virtual("isLocked").get(function () {
  const now = new Date();
  return this.stage !== "completed" && this.deadline < now;
});

// Computed priority + computed effective stage for each subtask
taskSchema.virtual("subTasksWithPriority").get(function () {
  const now = new Date();

  return this.subTasks.map((sub) => {
    const deadline = sub.deadline || sub.date || now;
    const diffInMs = deadline - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // priority calculation
    let priority = "low";
    if (diffInDays <= 2) priority = "high";
    else if (diffInDays <= 7) priority = "medium";
    else if (diffInDays <= 15) priority = "normal";

    // stage calculation (if expired but not completed)
    let effectiveStage = sub.stage;
    if (sub.stage !== "completed" && deadline < now) {
      effectiveStage = "overdue";
    }

    return {
      ...sub.toObject(),
      priority,
      effectiveStage,
    };
  });
});

// Pre-save hook for auto-assigning users
taskSchema.pre('save', function (next) {
  if (!this.isModified('subTasks')) {
    return next();
  }

  const lowMembers = new Set();
  this.subTasks.forEach((sub) => {
    if (sub.priority === 'low') {
      (sub.members || []).forEach((m) => lowMembers.add(m.toString()));
    }
  });

  this.subTasks.forEach((sub) => {
    if (sub.priority === 'high') {
      const existing = new Set((sub.members || []).map((m) => m.toString()));
      lowMembers.forEach((m) => existing.add(m));
      sub.members = Array.from(existing);
    }
  });

  next();
});

// Export the model
const Task = mongoose.model("Task", taskSchema);
export default Task;
