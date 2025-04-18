import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";

export const createTask = async (req, res) => {
  try {
    const { title, team, stage, deadline, assets } = req.body;

    if (!title || !team || !stage || !deadline) {
      return res.status(400).json({ status: false, message: "Missing required fields." });
    }

    const createdAt = new Date();
    const deadlineDate = new Date(deadline);
    const now = new Date();

    let finalStage = stage.toLowerCase();

    // Prevent invalid status for overdue tasks
    if (deadlineDate < now && finalStage !== "completed") {
      finalStage = "overdue";
    }

    const task = await Task.create({
      title,
      team,
      stage: finalStage,
      deadline: deadlineDate,
      createdAt,
      assets,
      activities: [{ type: "assigned", activity: "Task created" }],
    });

    return res.status(200).json({ status: true, task, message: "Task created successfully." });
  } catch (error) {
    console.error("Task Creation Error:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const duplicateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      ...task,
      title: task.title + " - Duplicate",
    });

    newTask.team = task.team;
    newTask.subTasks = task.subTasks;
    newTask.assets = task.assets;
    newTask.priority = task.priority;
    newTask.stage = task.stage;

    await newTask.save();

    //alert users of the task
    let text = "New task has been assigned to you";
    if (task.team.length > 1) {
      text = text + ` and ${task.team.length - 1} others.`;
    }

    text =
      text +
      ` The task priority is set a ${
        task.priority
      } priority, so check and act accordingly. The task date is ${task.date.toDateString()}. Thank you!!!`;

    await Notice.create({
      team: task.team,
      text,
      task: newTask._id,
    });

    res
      .status(200)
      .json({ status: true, message: "Task duplicated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const postTaskActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id);

    const data = {
      type,
      activity,
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    res
      .status(200)
      .json({ status: true, message: " Activity posted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const dashboardStatistics = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({
          isTrashed: false,
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 })
      : await Task.find({
          isTrashed: false,
          team: { $all: [userId] },
        })
          .populate({
            path: "team",
            select: "name role title email",
          })
          .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt")
      .limit(10)
      .sort({ _id: -1 });

    //   group task by stage and calculate counts
    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    // Group tasks by priority
    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    // calculate total tasks
    const totalTasks = allTasks?.length;
    const last10Task = allTasks?.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { stage, isTrashed } = req.query;

    let query = { isTrashed: isTrashed ? true : false };
    if (stage) query.stage = stage;

    let tasks = await Task.find(query)
      .populate({
        path: "team",
        select: "name title email",
      })
      .populate({
        path: "subTasks.members",
        select: "name fullName email",
      })
      .sort({ _id: -1 });

    // Automatically mark overdue tasks
    const now = new Date();
    tasks = tasks.map(task => {
      if (task.deadline < now && task.stage !== "completed") {
        task.stage = "overdue"; // Update the stage in memory
      }
      return task;
    });

    res.status(200).json({
      status: true,
      tasks,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate({
        path: "team",
        select: "name title role email",
      })
      .populate({
        path: "activities.by",
        select: "name",
      })
      .populate({
        path: "subTasks.members",
        select: "name fullName email",
      });

    res.status(200).json({
      status: true,
      task,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const createSubTask = async (req, res) => {
  try {
    const { title, tag, deadline, members, priority } = req.body;
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    // ❌ Prevent adding subtask if task is locked (overdue)
    if (task.isLocked) {
      return res.status(403).json({
        status: false,
        message: "Task is locked (overdue) and cannot be modified.",
      });
    }

    // ✅ Ensure valid members only (i.e., exist in parent task's team)
    const validMembers = (members || []).filter(member =>
      task.team.includes(member)
    );

    const newSubTask = {
      title,
      tag,
      deadline: new Date(deadline),
      members: validMembers,
      priority: priority?.toLowerCase() ?? "low",
    };

    task.subTasks.push(newSubTask);
    await task.save();

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const updateSubTask = async (req, res) => {
  const { id } = req.params;
  const { title, deadline, priority, tag, members } = req.body;

  try {
    const task = await Task.findOne({ "subTasks._id": id });
    if (!task) {
      return res.status(404).json({ message: "Subtask not found (parent task missing)" });
    }

    // ❌ Prevent editing if parent task is locked (overdue and not completed)
    if (task.isLocked) {
      return res.status(403).json({
        message: "Task is locked (overdue) and cannot be edited.",
      });
    }

    const subtask = task.subTasks.id(id);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // ✅ Update subtask fields
    subtask.title = title;
    subtask.deadline = deadline;
    subtask.priority = priority;
    subtask.tag = tag;
    subtask.members = members;

    await task.save();

    res.json({ message: "Subtask updated successfully", subtask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, team, stage, assets } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    // ❌ Prevent editing if task is locked (overdue)
    if (task.isLocked) {
      return res.status(403).json({
        status: false,
        message: "Task is locked (overdue) and cannot be edited.",
      });
    }

    if (title) task.title = title;
    if (date) task.deadline = new Date(date);
    if (team) task.team = team;
    if (assets) task.assets = assets;

    // Handle overdue logic
    const now = new Date();
    const newDeadline = date ? new Date(date) : task.deadline;
    let finalStage = stage ? stage.toLowerCase() : task.stage;

    if (finalStage !== "completed" && newDeadline < now) {
      finalStage = "overdue";
    }

    task.stage = finalStage;

    await task.save();

    res.status(200).json({ status: true, message: "Task updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const trashTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({
      status: true,
      message: `Task trashed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteRestoreTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany(
        { isTrashed: true },
        { $set: { isTrashed: false } }
      );
    }

    res.status(200).json({
      status: true,
      message: `Operation performed successfully.`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const uploadTaskDocument = async (req, res) => {
  try {
    const { taskId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filePaths = files.map((file) => file.filename); // Only store filename or full path if needed

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.assets = [...task.assets, ...filePaths];
    await task.save();

    res.status(200).json({ message: "Files uploaded successfully", assets: task.assets });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteSubTask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;  // Getting the taskId and subtaskId from params

    // Find the task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    // Find the subtask index in the task's subTasks array
    const subtaskIndex = task.subTasks.findIndex((subtask) => subtask._id.toString() === subtaskId);

    if (subtaskIndex === -1) {
      return res.status(404).json({ status: false, message: "Subtask not found" });
    }

    // Remove the subtask from the array
    task.subTasks.splice(subtaskIndex, 1);

    // Save the updated task
    await task.save();

    return res.status(200).json({ status: true, message: "Subtask deleted successfully" });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return res.status(500).json({ status: false, message: "Server error, could not delete subtask" });
  }
};


