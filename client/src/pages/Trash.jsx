import clsx from "clsx";
import React, { useState, useEffect } from "react";
import {
  MdDelete,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineRestore,
} from "react-icons/md";
import Title from "../components/Title";
import Button from "../components/Button";
import { PRIOTITYSTYELS, TASK_TYPE } from "../utils";
import ConfirmatioDialog from "../components/Dialogs";
import {
  useDeleteRestoreTaskMutation,
  useDeleteRestoreSubtaskMutation,
  useGetAlltaskQuery,
} from "../redux/slices/api/taskApiSlice";
import Loading from "../components/Loader";
import { toast } from "sonner";

// Priority icons
const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const Trash = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [msg, setMsg] = useState(null);
  const [type, setType] = useState("delete");
  const [selected, setSelected] = useState("");
  const [isSubtask, setIsSubtask] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const { data: trashedTaskData, isLoading: isLoadingTrashed } = useGetAlltaskQuery({
    strQuery: "",
    isTrashed: "true",
    search: "",
  });

  const trashedSubtasks = trashedTaskData?.trashedSubtasks || [];
  const trashedTasks = trashedTaskData?.tasks || [];

  console.log("Trashed Tasks:", trashedSubtasks);


  const [deleteRestoreTask] = useDeleteRestoreTaskMutation();
  const [deleteRestoreSubtask] = useDeleteRestoreSubtaskMutation();

  const getTaskIdForSubtask = (subtaskId) => {
  const sub = trashedSubtasks.find((s) => s._id === subtaskId);
  if (!sub) {
    console.warn("Subtask not found for ID:", subtaskId);
     console.log("All trashedSubtasks:", trashedSubtasks.map((s) => s._id));
    return "";
  }

  console.log("Resolved Subtask:", subtaskId, sub);
  console.log("Parent Task ID:", sub.parentTaskId);
  return sub.parentTaskId || "";
};


  const deleteRestoreHandler = async () => {
    try {
      const result = isSubtask
        ? await deleteRestoreSubtask({
            taskId: selectedTaskId,
            subtaskId: selected,
            actionType: type,
          }).unwrap()
        : await deleteRestoreTask({
            id: selected,
            actionType: type,
          }).unwrap();

      toast.success(result?.message);
      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong.");
      console.log("Error",error);
    }
  };

  const deleteClick = (id, isSub = false, taskId = "") => {
  setType("delete");
  setSelected(id);
  setIsSubtask(isSub);

  const resolvedTaskId = isSub ? taskId || getTaskIdForSubtask(id) : "";
  setSelectedTaskId(resolvedTaskId);

  setMsg("Do you want to permanently delete the selected item?");
  setOpenDialog(true);
};

const restoreClick = (id, isSub = false, taskId = "") => {
  setType("restore");
  setSelected(id);
  setIsSubtask(isSub);

  const resolvedTaskId = isSub ? taskId || getTaskIdForSubtask(id) : "";
  setSelectedTaskId(resolvedTaskId);

  setMsg("Do you want to restore the selected item?");
  setOpenDialog(true);
};


  const deleteAllClick = () => {
    setType("deleteAll");
    setIsSubtask(false);
    setMsg("Do you want to permanently delete all tasks and subtasks?");
    setOpenDialog(true);
  };

  const restoreAllClick = () => {
    setType("restoreAll");
    setIsSubtask(false);
    setMsg("Do you want to restore all tasks and subtasks?");
    setOpenDialog(true);
  };

  useEffect(() => {
    if (!openDialog) {
      setSelected("");
      setIsSubtask(false);
      setSelectedTaskId("");
    }
  }, [openDialog]);

  if (isLoadingTrashed) {
    return (
      <div className="py-10">
        <Loading />
      </div>
    );
  }

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Stage</th>
        <th className="py-2">Modified On</th>
        <th className="py-2 text-end">Actions</th>
      </tr>
    </thead>
  );

  const TableRow = ({ item }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[item.stage])} />
          <p className="text-black">{item.title}</p>
        </div>
      </td>
      <td className="py-2 capitalize">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIOTITYSTYELS[item.priority])}>
            {ICONS[item.priority]}
          </span>
          <span>{item.priority}</span>
        </div>
      </td>
      <td className="py-2 capitalize text-center md:text-start">{item.stage}</td>
      <td className="py-2 text-sm">{new Date(item.date).toDateString()}</td>
      <td className="py-2 flex gap-1 justify-end">
        <Button icon={<MdOutlineRestore />} onClick={() => restoreClick(item._id)} />
        <Button icon={<MdDelete className="text-red-600" />} onClick={() => deleteClick(item._id)} />
      </td>
    </tr>
  );

  const SubtaskTableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Title</th>
        <th className="py-2">Deadline</th>
        <th className="py-2">Stage</th>
        <th className="py-2">Project</th>
        <th className="py-2 text-end">Actions</th>
      </tr>
    </thead>
  );

  const SubtaskRow = ({ subtask }) => {
    console.log("Subtask ID: ",subtask._id);
    const taskId = getTaskIdForSubtask(subtask._id);

    return (
      <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
        <td className="py-2">
          <div className="flex items-center gap-2">
            <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[subtask.stage])} />
            <p className="text-black text-sm">{subtask.title}</p>
          </div>
        </td>
        <td className="py-2 text-sm">
          {subtask.deadline ? new Date(subtask.deadline).toDateString() : "N/A"}
        </td>
        <td className="py-2 capitalize">{subtask.stage}</td>
        <td className="py-2 text-sm">{subtask.parentTaskTitle || "N/A"}</td>
        <td className="py-2 flex gap-1 justify-end">
          <Button icon={<MdOutlineRestore />} onClick={() => restoreClick(subtask._id, true, taskId)} />
          <Button icon={<MdDelete className="text-red-600" />} onClick={() => deleteClick(subtask._id, true, taskId)} />
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
        <div className="flex items-center justify-between mb-8">
          <Title title="Trashed Projects" />
          <div className="flex gap-2 md:gap-4">
            <Button label="Restore All" icon={<MdOutlineRestore />} onClick={restoreAllClick} />
            <Button label="Delete All" icon={<MdDelete />} className="text-red-600" onClick={deleteAllClick} />
          </div>
        </div>

        {trashedTasks.length > 0 ? (
          <div className="bg-white px-2 md:px-6 py-4 shadow-md rounded mb-10">
            <div className="overflow-x-auto">
              <table className="w-full mb-5">
                <TableHeader />
                <tbody>
                  {trashedTasks.map((task) => (
                    <TableRow key={task._id} item={task} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic mb-10">No trashed projects found.</p>
        )}

        {trashedSubtasks.length > 0 ? (
          <div className="bg-white px-2 md:px-6 py-4 shadow-md rounded">
            <Title title="Trashed Tasks" />
            <div className="overflow-x-auto mt-4">
              <table className="w-full mb-5">
                <SubtaskTableHeader />
                <tbody>
                  {trashedSubtasks.map((subtask) => (
                    <SubtaskRow key={subtask._id} subtask={subtask} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No trashed tasks found.</p>
        )}
      </div>

      <ConfirmatioDialog
        open={openDialog}
        setOpen={setOpenDialog}
        msg={msg}
        setMsg={setMsg}
        type={type}
        setType={setType}
        onClick={deleteRestoreHandler}
      />
    </>
  );
};

export default Trash;
