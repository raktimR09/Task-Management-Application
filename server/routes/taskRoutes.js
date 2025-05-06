import express from "express";
import path from "path";
import {
  createSubTask,
  createTask,
  dashboardStatistics,
  deleteRestoreTask,
  duplicateTask,
  getTask,
  getTasks,
  postTaskActivity,
  trashTask,
  updateTask,
  uploadTaskDocument,
  updateSubTask,
  deleteSubTask,
  getTaskDocument,
  deleteTaskDocument,
  autoAssignUsersToSubtask,
  assignMissingUsersToHighPrioritySubtasks,
  getFilePreview,
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
import upload from '../utils/multer.js';
import { fileURLToPath } from 'url';


const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.post("/create", protectRoute, isAdminRoute, createTask);
router.post("/duplicate/:id", protectRoute, isAdminRoute, duplicateTask);
router.post("/activity/:id", protectRoute, postTaskActivity); 

router.get("/dashboard", protectRoute, dashboardStatistics);
router.get("/", protectRoute, getTasks);
router.get("/:id", protectRoute, getTask);

router.put("/create-subtask/:id", protectRoute, isAdminRoute, createSubTask);
router.put("/update/:id", protectRoute, isAdminRoute, updateTask);
router.put("/:id", protectRoute, isAdminRoute, trashTask);

// ✅ New subtask update route
router.put("/update-subtask/:id", protectRoute, isAdminRoute, updateSubTask);

router.delete("/delete-subtask/:taskId/:subtaskId", protectRoute, isAdminRoute, deleteSubTask);  // New delete route

router.delete(
  "/delete-restore/:id?",
  protectRoute,
  isAdminRoute,
  deleteRestoreTask
);

router.post('/upload/:taskId', upload.array('documents'), uploadTaskDocument);

router.get('/:taskId/documents/:docName', getTaskDocument);


router.delete('/:taskId/documents/:docId', deleteTaskDocument);

router.post('/auto-assign/:taskId/:subtaskId', autoAssignUsersToSubtask);
router.post('/assign-missing-high/:taskId/:subtaskId', assignMissingUsersToHighPrioritySubtasks);




export default router;
