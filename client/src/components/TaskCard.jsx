import clsx from "clsx";
import React, { useState } from "react";
import {
  MdAttachFile,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, formatDate } from "../utils";
import TaskDialog from "./task/TaskDialog";
import { BiMessageAltDetail } from "react-icons/bi";
import { FaList, FaEdit, FaTrashAlt } from "react-icons/fa";
import UserInfo from "./UserInfo";
import { IoMdAdd } from "react-icons/io";
import AddSubTask from "./task/AddSubTask";
import EditSubTask from "./task/EditSubTask";
import { useDeleteSubTaskMutation } from "../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const TaskCard = ({ task }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [deleteSubTask] = useDeleteSubTaskMutation();

  const priority = task?.priority?.toLowerCase();
  const isCompleted = task?.stage?.toLowerCase() === "completed";
  const isExpired = !isCompleted && new Date(task?.deadline) < new Date();

  const renderTaskStatus = () => {
    if (isCompleted) {
      return (
        <div className="flex flex-1 gap-1 items-center text-green-600 text-sm font-medium">
          ✅ <span className="uppercase">Completed</span>
        </div>
      );
    } else if (isExpired) {
      return (
        <div className="flex flex-1 gap-1 items-center text-red-600 text-sm font-medium">
          ⌛ <span className="uppercase">Expired</span>
        </div>
      );
    } else {
      return (
        <div
          className={clsx(
            "flex flex-1 gap-1 items-center text-sm font-medium",
            PRIOTITYSTYELS[priority]
          )}
        >
          <span className="text-lg">{ICONS[priority]}</span>
          <span className="uppercase">{priority ?? "no"} Priority</span>
        </div>
      );
    }
  };

  const renderSubtaskStatus = (sub) => {
    const isSubCompleted = sub?.stage?.toLowerCase() === "completed";
    const isSubExpired = !isSubCompleted && new Date(sub.deadline) < new Date();

    if (isSubCompleted) {
      return (
        <div className="text-green-600 font-medium flex items-center gap-1">
          ✅ <span>Completed</span>
        </div>
      );
    } else if (isSubExpired) {
      return (
        <div className="text-red-600 font-medium flex items-center gap-1">
          ⌛ <span>Expired</span>
        </div>
      );
    } else {
      return (
        <div>
          🔥 Priority: <span className="capitalize">{sub.priority ?? "none"}</span>
        </div>
      );
    }
  };

  const handleEdit = (subtask) => {
    setSelectedSubTask(subtask);
    setEditOpen(true);
  };

  const handleDeleteSubTask = async (subtaskId) => {
    try {
      const res = await deleteSubTask({ taskId: task._id, subtaskId }).unwrap();
      toast.success(res?.message);
      window.location.reload(); // 🔄 Reload after delete
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast.error("Failed to delete subtask");
    }
  };

  const handleEditSubTask = () => {
    setEditOpen(false);
    window.location.reload(); // 🔄 Reload after edit
  };

  const handleSubTaskModalClose = () => {
    setOpen(false);
    window.location.reload(); // 🔄 Reload after add subtask
  };

  return (
    <>
      <div className="w-full h-fit bg-white shadow-md p-4 rounded">
        <div className="w-full flex justify-between">
          {renderTaskStatus()}
          {user?.isAdmin && <TaskDialog task={task} />}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
          <h4 className="line-clamp-1 text-black">{task?.title}</h4>
        </div>

        <div className="text-sm text-gray-600 space-y-1 mt-1">
          <div>📅 Created: {formatDate(new Date(task?.createdAt))}</div>
          <div>⏰ Deadline: {formatDate(new Date(task?.deadline))}</div>
        </div>

        <div className="w-full border-t border-gray-200 my-2" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <BiMessageAltDetail />
              <span>{task?.activities?.length ?? 0}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <MdAttachFile />
              <span>{task?.assets?.length ?? 0}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <FaList />
              <span>0/{task?.subTasks?.length ?? 0}</span>
            </div>
          </div>

          <div className="flex flex-row-reverse">
            {task?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  BGS[index % BGS?.length]
                )}
              >
                <UserInfo user={m} />
              </div>
            ))}
          </div>
        </div>

        {/* Subtasks */}
        <div className="py-4 border-t border-gray-200">
          {task?.subTasksWithPriority?.length > 0 ? (
            task.subTasksWithPriority.map((sub, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <h5 className="text-base font-semibold text-black">{sub.title}</h5>
                  {user?.isAdmin && !task?.isLocked && (
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        onClick={() => handleEdit(sub)}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                        onClick={() => handleDeleteSubTask(sub._id)}
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <div className="pl-2 text-sm text-gray-700 space-y-1 mt-1">
                  <div>⏰ {formatDate(new Date(sub.deadline))}</div>
                  <div>{renderSubtaskStatus(sub)}</div>
                  <div>
                    <span className="bg-blue-600/10 px-3 py-1 rounded-full text-blue-700 font-medium inline-block">
                      {sub.tag}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {sub.members?.map((m, i) => (
                      <div
                        key={i}
                        className={clsx(
                          "w-6 h-6 rounded-full text-white flex items-center justify-center text-xs",
                          BGS[i % BGS.length]
                        )}
                      >
                        <UserInfo user={m} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-500">No Sub Task</span>
          )}
        </div>

        <div className="w-full pb-2">
          <button
            onClick={() => setOpen(true)}
            disabled={task?.isLocked || !user?.isAdmin}
            className="w-full flex gap-4 items-center text-sm text-gray-500 font-semibold disabled:cursor-not-allowed disabled:text-gray-300"
          >
            <IoMdAdd className="text-lg" />
            <span>ADD SUBTASK</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <AddSubTask
        open={open}
        setOpen={handleSubTaskModalClose} // 🔄 triggers reload after close
        id={task._id}
        team={task.team}
      />
      {selectedSubTask && (
        <EditSubTask
          open={editOpen}
          setOpen={setEditOpen}
          subTask={selectedSubTask}
          team={task.team}
          onSave={handleEditSubTask} // 🔄 triggers reload
        />
      )}
    </>
  );
};

export default TaskCard;
