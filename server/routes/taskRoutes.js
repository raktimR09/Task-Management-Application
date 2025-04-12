import express from "express";
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
} from "../controllers/taskController.js";
import { isAdminRoute, protectRoute } from "../middlewares/authMiddleware.js";
import upload from '../utils/multer.js';

const router = express.Router();

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

router.post('/upload/:taskId', upload.single('document'), uploadTaskDocument);

export default router;
