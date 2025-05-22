import mongoose from 'mongoose';
import Notice from "../models/notification.js";
import Task from "../models/task.js";
import User from "../models/user.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const { id } = req.params; // Task ID
    const { userId } = req.user;
    const { type, activity, subtaskId } = req.body;

    if (!subtaskId) {
      return res.status(400).json({ status: false, message: "Subtask ID is required" });
    }

    // Fetch the task and locate the subtask
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found" });
    }

    const subtask = task.subTasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ status: false, message: "Subtask not found" });
    }

    const now = new Date();

    // Construct and push the new activity into the subtask
    const activityData = {
      type,
      activity,
      by: userId,
      date: now,
    };
    subtask.activities.push(activityData);

    // Update subtask stage based on activity type
    if (type.toLowerCase() === "completed") {
      subtask.stage = "completed";
    } else if (subtask.stage === "todo") {
      subtask.stage = "in progress";
    }

    // Mark subtask as overdue if deadline passed and not completed
    if (subtask.stage !== "completed" && subtask.deadline < now) {
      subtask.stage = "overdue";
    }

    // Update task stage based on subtask stages
    if (task.subTasks.every(st => st.stage === "completed")) {
      task.stage = "completed";
    } else if (task.stage === "todo") {
      task.stage = "in progress";
    }

    // Save the whole task document (subtask is embedded)
    await task.save();

    return res.status(200).json({ status: true, message: "Subtask activity posted successfully." });
  } catch (error) {
    console.error(error);
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
        path: "subTasks.activities.by",
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

    // Prevent adding subtask if task is locked (overdue)
    if (task.isLocked) {
      return res.status(403).json({
        status: false,
        message: "Task is locked (overdue) and cannot be modified.",
      });
    }

    // Ensure valid members only (i.e., exist in parent task's team)
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

    // If the task is completed, change stage to 'in progress' when adding a new subtask
    if (task.stage?.toLowerCase() === "completed") {
      task.stage = "in progress";
    }

    await task.save();

    res.status(200).json({ status: true, message: "SubTask added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const updateSubTask = async (req, res) => {
  const { id } = req.params;
  const { title, deadline, priority, tag, members, previousStage } = req.body;

  try {
    const task = await Task.findOne({ "subTasks._id": id });
    if (!task) {
      return res.status(404).json({ message: "Subtask not found (parent task missing)" });
    }

    if (task.isLocked) {
      return res.status(403).json({
        message: "Task is locked (overdue) and cannot be edited.",
      });
    }

    const subtask = task.subTasks.id(id);
    if (!subtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    const wasExpired = subtask.stage === "overdue";
    const isNowFuture = deadline && new Date(deadline) > new Date();

    // Calculate if deadline is extended (compare new deadline with old deadline)
    let deadlineExtended = false;
    if (deadline && subtask.deadline) {
      const oldDeadline = new Date(subtask.deadline);
      const newDeadline = new Date(deadline);
      deadlineExtended = newDeadline > oldDeadline;
    }

    // Update fields only if they exist in request
    if (title) subtask.title = title;
    if (deadline) subtask.deadline = deadline; // update after checking old deadline
    if (priority) subtask.priority = priority;
    if (tag) subtask.tag = tag;

    // Update members only if provided
    if (Array.isArray(members)) {
      subtask.members = members.map((m) => new mongoose.Types.ObjectId(m));
    }

    // Restore stage from overdue only if valid and deadline extended or is now future
    if (wasExpired && isNowFuture && previousStage && previousStage !== "overdue") {
      // Use your existing logic to set stage based on activity
      if (subtask.activities && subtask.activities.length > 0) {
        subtask.stage = "in progress";
      } else {
        subtask.stage = "todo";
      }
      console.log("Subtask Stage restored from overdue:", subtask.stage);
    }

    // If deadline was extended but stage was not overdue, update stage based on activity
    if (deadlineExtended) {
      if (subtask.activities && subtask.activities.length > 0) {
        subtask.stage = "in progress";
      } else {
        subtask.stage = "todo";
      }
      console.log("Subtask Stage updated due to deadline extension:", subtask.stage);
    }

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

    const now = new Date();

    // If task is locked (overdue)
    if (task.isLocked) {
      console.log(task.deadline);
      console.log(date);
      // Allow only deadline extension (date change)
      if (date && new Date(date) > task.deadline) {
        task.deadline = new Date(date);
        // Possibly update stage if extended deadline is now in future
        if (stage) {
          const newStage = stage.toLowerCase();
          if (newStage === "completed") {
            task.stage = "completed";
          } else if (new Date(date) >= now) {
            // If new deadline is in future, revert overdue status
            task.stage = "in progress"; // or whatever stage fits your workflow
          }
        } 
        await task.save();
        return res.status(200).json({ status: true, message: "Deadline extended successfully." });
      } else {
        return res.status(403).json({
          status: false,
          message: "Task is locked (overdue). Only extending deadline is allowed.",
        });
      }
    }

    // If not locked, allow full update
    if (title) task.title = title;
    if (date) task.deadline = new Date(date);
    if (team) task.team = team;
    if (assets) task.assets = assets;

    // Handle overdue logic for stage
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
    const files = req.files; // Expect upload.array('documents') on frontend

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Prepare an array of document objects to push into the task's documents array
    const documentsToAdd = files.map((file) => ({
      name: file.originalname,    // The original file name
      path: file.path,            // The file path where multer saved it
      uploadedAt: new Date(),     // Timestamp of when the document was uploaded
    }));

    // Find the task by its ID
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Push new documents into the task's `documents` array
    task.documents.push(...documentsToAdd);

    // Save the task with the updated documents array
    await task.save();

    // Return the updated documents array
    res.status(200).json({
      message: "Files uploaded successfully",
      documents: task.documents, // Send the updated documents array back in the response
    });
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

export const getTaskDocument = async (req, res) => {
  try {
    const { taskId, docName } = req.params;

    // Fetch the task to check if document exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the document by name
    const doc = task.documents.find(document => document.name === docName);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Path to the document
    const docPath = path.join(__dirname, `../../uploads/${doc.path}`);

    // Return the document to be previewed
    res.sendFile(docPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteTaskDocument = async (req, res) => {
  try {
    const { taskId, docId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Remove the document from the task's documents array
    task.documents = task.documents.filter(doc => doc._id.toString() !== docId);

    await task.save();

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const autoAssignUsersToSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: "Task not found." });
    }

    // Find the subtask you want to assign users to
    const targetSubtask = task.subTasks.id(subtaskId);
    if (!targetSubtask) {
      return res.status(404).json({ status: false, message: "Subtask not found." });
    }

    // Collect all members from lower priority subtasks
    const lowerPriorityMembers = new Set();
    task.subTasks.forEach((sub) => {
      // Assuming your subtask priority virtual field exists
      const now = new Date();
      const deadline = sub.deadline || sub.date || now;
      const diffInMs = deadline - now;
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
      let priority = "low";
      if (diffInDays <= 2) priority = "high";
      else if (diffInDays <= 7) priority = "medium";
      else if (diffInDays <= 15) priority = "normal";

      if (priority === "low"||priority==="medium"||priority==="normal") {
        sub.members.forEach((member) => lowerPriorityMembers.add(member.toString()));
      }
    });

    if (lowerPriorityMembers.size === 0) {
      return res.status(400).json({ status: false, message: "No users found in lower priority subtasks." });
    }

    // Assign these members to the target subtask
    const existingMemberIds = targetSubtask.members.map(m => m.toString());
    const newMembers = Array.from(lowerPriorityMembers).filter(
      m => !existingMemberIds.includes(m)
    );

    targetSubtask.members.push(...newMembers);

    await task.save();

    return res.status(200).json({
      status: true,
      message: "Users assigned successfully from lower priority subtasks.",
      subtask: targetSubtask,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

export const assignMissingUsersToHighPrioritySubtasks = async (req, res) => {
  try {
    const { taskId } = req.params;

    // 1) Load the task
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ status: false, message: 'Task not found.' });
    }

    const now = new Date();

    // 2) Gather all user IDs assigned in any subtask
    const assignedSet = new Set();
    const userSubtaskMap = {}; // { userId: [subtaskStages] }
    task.subTasks.forEach(sub => {
      (sub.members || []).forEach(m => {
        const userId = m.toString();
        assignedSet.add(userId);
        if (!userSubtaskMap[userId]) userSubtaskMap[userId] = [];
        userSubtaskMap[userId].push(sub.stage);
      });
    });

    // 3) Find users in overdue subtasks
    const overdueUsers = new Set();
    task.subTasks.forEach(sub => {
      const deadline = new Date(sub.deadline || sub.date || now);
      if (sub.stage !== 'completed' && deadline < now) {
        (sub.members || []).forEach(m => overdueUsers.add(m.toString()));
      }
    });

    // 4) Determine missing team members
    const teamMemberIds = task.team.map(m => m.toString());
    const missingTeamMembers = teamMemberIds.filter(id => !assignedSet.has(id));

    // 5) Determine free users (assigned only to completed subtasks)
    const freeUsers = [];
    for (const [userId, stages] of Object.entries(userSubtaskMap)) {
      if (stages.every(stage => stage === 'completed')) {
        freeUsers.push(userId);
      }
    }

    // 6) Combine all assignable users: missing team members, overdue users, and free users
    const allToAssign = Array.from(new Set([...missingTeamMembers, ...overdueUsers, ...freeUsers]));

    if (allToAssign.length === 0) {
      return res.status(200).json({
        status: true,
        message: 'All relevant users are already assigned or unavailable.',
      });
    }

    // 7) Get high-priority subtasks
    const highPrioritySubs = task.subTasksWithPriority.filter(sub => sub.priority === 'high');

    if (highPrioritySubs.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'No high-priority subtasks found to assign users.',
      });
    }

    // 8) Assign users to each high-priority subtask
    highPrioritySubs.forEach(updatedSub => {
      const originalSub = task.subTasks.id(updatedSub._id);
      const existing = new Set((originalSub.members || []).map(m => m.toString()));

      allToAssign.forEach(id => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          existing.add(id);
        }
      });

      originalSub.members = Array.from(existing).map(id => new mongoose.Types.ObjectId(id));
    });

    // 9) Save
    await task.save();

    return res.status(200).json({
      status: true,
      message: 'Free users have been assigned to high-priority subtasks.',
      updatedSubtaskIds: highPrioritySubs.map(s => s._id),
    });

  } catch (error) {
    console.error('assignMissingUsersToHighPrioritySubtasks error:', error);
    return res.status(500).json({ status: false, message: 'Server error.' });
  }
};


// Controller method to get the file preview
export const getFilePreview = async (req, res) => {
  const { taskId, docId } = req.params;

  try {
    // Find the task by its ID
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Find the document by its ID
    const doc = task.documents.find(d => d._id.toString() === docId);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Assuming files are stored in a folder on the server
    const filePath = path.resolve(__dirname, `../uploads/${doc.fileName}`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Send file details (e.g., file path, file type) for preview
    res.json({
      fileName: doc.fileName,
      filePath: `/uploads/${doc.fileName}`, // assuming files are served from a public folder
      fileType: doc.fileType, // e.g., 'image/jpeg', 'application/pdf', etc.
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




