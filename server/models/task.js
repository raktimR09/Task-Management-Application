import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true },
    deadline: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    stage: {
      type: String,
      default: "todo",
      enum: ["todo", "in progress", "completed"],
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
    subTasks: [
      {
        title: String,
        date: Date,
        tag: String,
      },
    ],
    assets: [String],
    team: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Dynamic priority based on deadline
taskSchema.virtual("priority").get(function () {
  if (!this.deadline) return "normal";

  const now = new Date();
  const diffInMs = this.deadline - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays <= 2) return "high";
  if (diffInDays >= 3 && diffInDays <= 7) return "medium";
  if (diffInDays >= 8 && diffInDays <= 15) return "normal";
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

// Include virtuals in output
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

const Task = mongoose.model("Task", taskSchema);

export default Task;
