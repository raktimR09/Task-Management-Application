import mongoose, { Schema } from "mongoose";

const subTaskSchema = new Schema(
  {
    title: { type: String, required: true },
    tag: String,
    date: {
      type: Date,
      default: Date.now, // Subtask creation date
    },
    deadline: {
      type: Date,
      default: Date.now, // Defaults to creation if not provided
    },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: false }
);

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
      },
    ],
    subTasks: [subTaskSchema],
    assets: [String],
    documents: [
      {
        name: String,
        path: String,
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

// ✅ Dynamic priority calculation for parent task
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

// ✅ Virtual stage with overdue logic
taskSchema.virtual("effectiveStage").get(function () {
  const now = new Date();
  if (this.stage !== "completed" && this.deadline < now) {
    return "overdue";
  }
  return this.stage;
});

// ✅ Compute subtask priority dynamically
taskSchema.virtual("subTasksWithPriority").get(function () {
  return this.subTasks.map((sub) => {
    const now = new Date();
    const deadline = sub.deadline || sub.date || now;
    const diffInMs = deadline - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    let priority = "low";
    if (diffInDays <= 2) priority = "high";
    else if (diffInDays <= 7) priority = "medium";
    else if (diffInDays <= 15) priority = "normal";

    return { ...sub.toObject(), priority };
  });
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
