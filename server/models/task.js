import mongoose, { Schema } from "mongoose";

// Subtask Schema
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
    isTrashed: { type: Boolean, default: false },
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

// --- Virtuals ---

// Dynamic priority for Task
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

// Is task locked (based on deadline and completion)
taskSchema.virtual("isLocked").get(function () {
  const now = new Date();
  return this.stage !== "completed" && this.deadline <= now;
});

// Computed priority + effective stage for each subtask (virtual only)
taskSchema.virtual("subTasksWithPriority").get(function () {
  const now = new Date();

  return this.subTasks.map((sub) => {
    const deadline = sub.deadline || sub.date || now;
    const diffInMs = deadline - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    // priority
    let priority = "low";
    if (diffInDays <= 2) priority = "high";
    else if (diffInDays <= 7) priority = "medium";
    else if (diffInDays <= 15) priority = "normal";

    // effective stage (computed only)
    let effectiveStage = sub.stage;
    if (sub.stage !== "completed" && deadline <= now) {
      effectiveStage = "overdue";
    }

    return {
      ...sub.toObject(),
      priority,
      effectiveStage,
    };
  });
});

// --- Pre-save Hook ---

taskSchema.pre("save", function (next) {
  const now = new Date();

  // Update task stage to overdue if deadline has passed and not completed
  if (this.stage !== "completed" && this.deadline <= now) {
    this.stage = "overdue";
  }

  // Update each subtask's stage to overdue if deadline passed and not completed
  this.subTasks.forEach((sub) => {
    if (sub.stage !== "completed" && sub.deadline <= now) {
      sub.stage = "overdue";
    }
  });

  // Auto-assign members from low-priority to high-priority subtasks
  if (this.isModified("subTasks")) {
    const lowMembers = new Set();
    this.subTasks.forEach((sub) => {
      if (sub.priority === "low") {
        (sub.members || []).forEach((m) => lowMembers.add(m.toString()));
      }
    });

    this.subTasks.forEach((sub) => {
      if (sub.priority === "high") {
        const existing = new Set((sub.members || []).map((m) => m.toString()));
        lowMembers.forEach((m) => existing.add(m));
        sub.members = Array.from(existing);
      }
    });
  }

  next();
});

// --- Model Export ---
const Task = mongoose.model("Task", taskSchema);
export default Task;
