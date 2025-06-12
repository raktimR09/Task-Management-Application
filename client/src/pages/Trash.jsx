import clsx from "clsx";
import React, { useState } from "react";
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
import { useDeleteRestoreTaskMutation, useGetAlltaskQuery } from "../redux/slices/api/taskApiSlice";
import Loading from "../components/Loader";
import { toast } from "sonner";

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

  const { data, isLoading } = useGetAlltaskQuery({
    strQuery: "",
    isTrashed: "true",
    search: "",
  });

  const [deleteRestoreTask] = useDeleteRestoreTaskMutation();

  const deleteRestoreHandler = async () => {
    try {
      let result;
      switch (type) {
        case "delete":
          result = await deleteRestoreTask({ id: selected, actionType: "delete" }).unwrap();
          break;
        case "deleteAll":
          result = await deleteRestoreTask({ id: selected, actionType: "deleteAll" }).unwrap();
          break;
        case "restore":
          result = await deleteRestoreTask({ id: selected, actionType: "restore" }).unwrap();
          break;
        case "restoreAll":
          result = await deleteRestoreTask({ id: selected, actionType: "restoreAll" }).unwrap();
          break;
      }
      toast.success(result?.message);
      setTimeout(() => {
        setOpenDialog(false);
        window.location.reload();
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error(error?.message);
    }
  };

  const deleteAllClick = () => {
    setType("deleteAll");
    setMsg("Do you want to permanently delete all tasks and subtasks?");
    setOpenDialog(true);
  };

  const restoreAllClick = () => {
    setType("restoreAll");
    setMsg("Do you want to restore all tasks and subtasks?");
    setOpenDialog(true);
  };

  const deleteClick = (id) => {
    setType("delete");
    setSelected(id);
    setMsg("Do you want to permanently delete the selected item?");
    setOpenDialog(true);
  };

  const restoreClick = (id) => {
    setSelected(id);
    setType("restore");
    setMsg("Do you want to restore the selected item?");
    setOpenDialog(true);
  };

  if (isLoading) {
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
          <p className="w-full line-clamp-2 text-base text-black">{item?.title}</p>
        </div>
      </td>
      <td className="py-2 capitalize">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIOTITYSTYELS[item?.priority])}>
            {ICONS[item?.priority]}
          </span>
          <span>{item?.priority}</span>
        </div>
      </td>
      <td className="py-2 capitalize text-center md:text-start">{item?.stage}</td>
      <td className="py-2 text-sm">{new Date(item?.date).toDateString()}</td>
      <td className="py-2 flex gap-1 justify-end">
        <Button icon={<MdOutlineRestore className="text-xl text-gray-500" />} onClick={() => restoreClick(item._id)} />
        <Button icon={<MdDelete className="text-xl text-red-600" />} onClick={() => deleteClick(item._id)} />
      </td>
    </tr>
  );

  const SubtaskTableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Title</th>
        <th className="py-2">Deadline</th>
        <th className="py-2">Stage</th>
        <th className="py-2">Parent Task</th>
        <th className="py-2 text-end">Actions</th>
      </tr>
    </thead>
  );

  const SubtaskRow = ({ subtask }) => (
    <tr className="border-b border-gray-200 text-gray-600 hover:bg-gray-400/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[subtask.stage])} />
          <p className="text-black text-sm">{subtask.title}</p>
        </div>
      </td>
      <td className="py-2 text-sm">
        {subtask?.deadline ? new Date(subtask.deadline).toDateString() : "N/A"}
      </td>
      <td className="py-2 capitalize text-center md:text-start">{subtask.stage}</td>
      <td className="py-2 text-sm">{subtask?.parentTaskTitle || "N/A"}</td>
      <td className="py-2 flex gap-1 justify-end">
        <Button icon={<MdOutlineRestore className="text-xl text-gray-500" />} onClick={() => restoreClick(subtask._id)} />
        <Button icon={<MdDelete className="text-xl text-red-600" />} onClick={() => deleteClick(subtask._id)} />
      </td>
    </tr>
  );

  return (
    <>
      <div className="w-full md:px-1 px-0 mb-6">
  {/* Header and Actions */}
  <div className="flex items-center justify-between mb-8">
    <Title title="Trashed Projects" />
    <div className="flex gap-2 md:gap-4 items-center">
      <Button
        label="Restore All"
        icon={<MdOutlineRestore className="text-lg hidden md:flex" />}
        className="flex flex-row-reverse gap-1 items-center text-black text-sm md:text-base rounded-md 2xl:py-2.5"
        onClick={restoreAllClick}
      />
      <Button
        label="Delete All"
        icon={<MdDelete className="text-lg hidden md:flex" />}
        className="flex flex-row-reverse gap-1 items-center text-red-600 text-sm md:text-base rounded-md 2xl:py-2.5"
        onClick={deleteAllClick}
      />
    </div>
  </div>

  {/* Trashed Tasks Table */}
  {data?.tasks?.length > 0 ? (
    <div className="bg-white px-2 md:px-6 py-4 shadow-md rounded mb-10">
      <div className="overflow-x-auto">
        <table className="w-full mb-5">
          <TableHeader />
          <tbody>
            {data.tasks.map((tk, id) => (
              <TableRow key={id} item={tk} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <p className="text-gray-500 text-sm italic mb-10">No trashed projects found.</p>
  )}

  {/* Trashed Subtasks Table */}
  {data?.trashedSubtasks?.length > 0 ? (
    <div className="bg-white px-2 md:px-6 py-4 shadow-md rounded">
      <Title title="Trashed Subtasks" />
      <div className="overflow-x-auto mt-4">
        <table className="w-full mb-5">
          <SubtaskTableHeader />
          <tbody>
            {data.trashedSubtasks.map((subtask, idx) => (
              <SubtaskRow key={idx} subtask={subtask} />
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
