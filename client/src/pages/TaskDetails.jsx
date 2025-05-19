import clsx from "clsx";
import moment from "moment";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  FaBug,
  FaTasks,
  FaThumbsUp,
  FaUser
} from "react-icons/fa";
import {
  GrInProgress
} from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";

import Tabs from "../components/Tabs";
import Loading from "../components/Loader";
import Button from "../components/Button";
import { PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import {
  useAssignMissingUsersToHighPrioritySubtasksMutation,
  useAutoAssignUsersToHighPrioritySubtasksMutation,
  useDeleteTaskDocumentMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";
import { SiGooglesearchconsole } from "react-icons/si";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  low: <MdKeyboardArrowDown />,
};

const bgColor = {
  high: "bg-red-200",
  medium: "bg-yellow-200",
  low: "bg-blue-200",
};

const TABS = [
  { title: "Task Detail", icon: <FaTasks /> },
  { title: "Activities/Timeline", icon: <RxActivityLog /> },
];

const TASKTYPEICON = {
  commented: (
    <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
      <MdOutlineMessage />
    </div>
  ),
  started: (
    <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
      <FaThumbsUp size={20} />
    </div>
  ),
  assigned: (
    <div className='w-6 h-6 flex items-center justify-center rounded-full bg-gray-500 text-white'>
      <FaUser size={14} />
    </div>
  ),
  bug: (
    <div className='text-red-600'>
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
      <MdOutlineDoneAll size={24} />
    </div>
  ),
  "in progress": (
    <div className='w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white'>
      <GrInProgress size={16} />
    </div>
  ),
};

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const Activities = ({ id, refetch }) => {
  const { user } = useSelector((state) => state.auth);
  const [selectedType, setSelectedType] = useState(act_types[0]);
  const [selectedSubtask, setSelectedSubtask] = useState("");
  const [text, setText] = useState("");

  const [postActivity, { isLoading }] = usePostTaskActivityMutation();
  const { data } = useGetSingleTaskQuery({ id });

  const subtasks = data?.task?.subTasks || [];
  const isAssignedUser = data?.task?.team?.some((m) => m?._id === user?._id);
  const isAdmin = user?.isAdmin === true;

  const taskStage = data?.task?.stage?.toLowerCase();
  const canAddActivity =
    isAssignedUser && taskStage !== "overdue" && taskStage !== "completed";

  const allActivitiesBySubtask = subtasks.map((st) => ({
    subtaskTitle: st.title,
    activities: st.activities || [],
  }));

  const selectedSubtaskObj = subtasks.find((s) => s._id === selectedSubtask);
  const activity = selectedSubtaskObj?.activities || [];

  const handleSubmit = async () => {
    if (!text || !selectedSubtask) return;

    const selected = subtasks.find((s) => s._id === selectedSubtask);
    if (!selected || selected.stage === "overdue" || selected.stage === "completed") {
      toast.error("Cannot add activity to overdue or completed subtask.");
      return;
    }

    try {
      const activityData = {
        type: selectedType.toLowerCase(),
        activity: text,
        subtaskId: selectedSubtask,
      };
      const result = await postActivity({ data: activityData, id }).unwrap();
      toast.success(result?.message);
      setText("");
      setSelectedSubtask("");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  const Card = ({ item }) => (
    <div className="flex space-x-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-10 h-10 flex items-center justify-center">
          {TASKTYPEICON[item?.type]}
        </div>
        <div className="w-full flex items-center">
          <div className="w-0.5 bg-gray-300 h-full"></div>
        </div>
      </div>
      <div className="flex flex-col gap-y-1 mb-8">
        <p className="font-semibold">{item?.by?.name}</p>
        <div className="text-gray-500 space-y-1">
          <span className="capitalize block">{item?.type}</span>
          <span className="text-sm text-gray-400">
            {moment(item?.date).format("MMMM Do YYYY, h:mm A")}
          </span>
        </div>
        <div className="text-gray-700">{item?.activity}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto">
      {/* Activity Feed */}
      <div className="w-full md:w-1/2">
        <h4 className="text-gray-600 font-semibold text-lg mb-5">Subtask Activities</h4>

        {isAdmin ? (
          allActivitiesBySubtask.map(({ subtaskTitle, activities }) => (
            <div key={subtaskTitle} className="mb-8">
              <h5 className="font-medium text-gray-700 mb-3">{subtaskTitle}</h5>
              {activities.length > 0 ? (
                activities.map((act, idx) => <Card key={idx} item={act} />)
              ) : (
                <p className="text-gray-400 italic">No activity for this subtask.</p>
              )}
            </div>
          ))
        ) : (
          <>
            {!selectedSubtask ? (
              <p className="text-gray-400 italic">
                Select a subtask to view its activity log.
              </p>
            ) : activity.length > 0 ? (
              activity.map((el, idx) => <Card key={idx} item={el} />)
            ) : (
              <p className="text-gray-400 italic">No activity recorded for this subtask.</p>
            )}
          </>
        )}
      </div>

      {/* Add Activity */}
      {canAddActivity && (
        <div className="w-full md:w-1/3">
          <h4 className="text-gray-600 font-semibold text-lg mb-5">Add Activity</h4>

          <label className="block mb-2">
            <span className="text-gray-700">For Subtask:</span>
            <select
              className="mt-1 block w-full border border-gray-300 rounded p-2"
              value={selectedSubtask}
              onChange={(e) => setSelectedSubtask(e.target.value)}
            >
              <option value="">-- Select a subtask --</option>
              {subtasks.map((st) => (
                <option
                  key={st._id}
                  value={st._id}
                  disabled={st.stage === "overdue" || st.stage === "completed"}
                >
                  {st.title}{" "}
                  {st.stage === "overdue"
                    ? "(Overdue)"
                    : st.stage === "completed"
                    ? "(Completed)"
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-5 mb-4">
            {act_types.map((item) => (
              <label key={item} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="activityType"
                  checked={selectedType === item}
                  onChange={() => setSelectedType(item)}
                  className="w-4 h-4"
                />
                <span>{item}</span>
              </label>
            ))}
          </div>

          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Describe your activity…"
            className="w-full border border-gray-300 rounded p-3 focus:ring-2 ring-blue-500"
          />

          <div className="mt-4">
            {isLoading ? (
              <Loading />
            ) : (
              <Button
                type="button"
                label="Submit"
                onClick={handleSubmit}
                disabled={!text || !selectedSubtask}
                className="bg-blue-600 text-white rounded px-4 py-2"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const TaskDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);

  if (!id) {
    console.error("Task ID is missing!");
    return <div className="p-4 text-red-500">No task selected.</div>;
  }

  const { data, isLoading, refetch } = useGetSingleTaskQuery({ id });
  const [selected, setSelected] = useState(0);
  const [deleteTaskDocument] = useDeleteTaskDocumentMutation();
  const [previewDoc, setPreviewDoc] = useState(null);
  const task = data?.task;
  const [autoAssignUsers] = useAutoAssignUsersToHighPrioritySubtasksMutation();
  const [assignMissingUsers] = useAssignMissingUsersToHighPrioritySubtasksMutation();

  // Helper: Check if subtask deadline is expired based on current date
  const isSubtaskExpired = (deadline) => {
    if (!deadline) return false; // No deadline means not expired
    return moment(deadline).isBefore(moment(), 'day'); // expired if deadline is before today
  };

  const handleAutoAssignUsersClick = async (taskId, subtaskId, priority) => {
    console.log("Task ID:", taskId);
    console.log("Subtask ID:", subtaskId);
    console.log("Priority:", priority);

    try {
      const res = await autoAssignUsers({ taskId, subtaskId }).unwrap();
      console.log("Auto-assign success:", res);
      toast.success('Users added to high priority subtask!');
      refetch();
    } catch (error) {
      console.error("Auto-assign failed. Error object:", error);
      if (error?.data) {
        console.error("Error response from server:", error.data);
        toast.error(error.data.message || "Server error while auto-assigning users.");
      } else {
        toast.error("Unexpected error while auto-assigning users.");
      }
    }
  };

  const handleAssignMissingUsers = async (taskId, subtaskId, priority) => {
    try {
      console.log("Task ID:", taskId);
      console.log("Subtask ID:", subtaskId);
      console.log("Priority:", priority);
      const res = await assignMissingUsers({ taskId, subtaskId }).unwrap();
      toast.success('Free users successfully assigned!');
      refetch();
    } catch (error) {
      toast.error('Error while assigning missing users.');
      console.error(error);
    }
  };

  const handlePreviewClick = (doc) => {
    if (doc.path) {
      const normalizedPath = doc.path.replace(/\\/g, '/');
      const fileName = normalizedPath.split('/').pop();
      const backendURL = `http://localhost:8800/uploads/${fileName}`;
      setPreviewDoc({ ...doc, path: backendURL });
    } else {
      console.warn('Document path is missing or invalid:', doc);
    }
  };

  const handleClosePreview = () => setPreviewDoc(null);

  const handleDeleteDocument = async (docId) => {
    try {
      const response = await deleteTaskDocument({ taskId: id, docId }).unwrap();
      toast.success(response.message);
      refetch();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className='py-10'>
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
        <h1 className='text-2xl text-gray-600 font-bold'>{task?.title}</h1>

        <Tabs tabs={TABS} setSelected={setSelected}>
          {selected === 0 ? (
            <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 bg-white shadow-md p-8 overflow-y-auto'>
              {/* LEFT */}
              <div className='w-full md:w-1/2 space-y-8'>
                {/* Priority and Stage */}
                <div className='flex items-center gap-5'>
                  {!["overdue", "completed"].includes(task?.stage?.toLowerCase()) && (
                    <div
                      className={clsx(
                        "flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full",
                        PRIOTITYSTYELS[task?.priority],
                        bgColor[task?.priority]
                      )}
                    >
                      <span className='text-lg'>{ICONS[task?.priority]}</span>
                      <span className='uppercase'>{task?.priority} Priority</span>
                    </div>
                  )}

                  <div className='flex items-center gap-2'>
                    <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task?.stage])} />
                    <span className='text-black uppercase'>{task?.stage}</span>
                  </div>
                </div>

                <p className='text-gray-500'>
                  Created At: {moment(task?.createdAt).format("MMMM Do YYYY, h:mm a")}
                </p>

                {/* Asset/SubTask count */}
                <div className='flex items-center gap-8 p-4 border-y border-gray-200'>
                  <div className='space-x-2'>
                    <span className='font-semibold'>Sub-Task :</span>
                    <span>{task?.subTasks?.length}</span>
                  </div>
                </div>

                {/* Task Team */}
                <div className='space-y-4 py-6'>
                  <p className='text-gray-600 font-semibold text-sm'>TASK TEAM</p>
                  <div className='space-y-3'>
                    {task?.team?.map((m, index) => (
                      <div
                        key={index}
                        className='flex gap-4 py-2 items-center border-t border-gray-200'
                      >
                        <div className='w-10 h-10 rounded-full text-white flex items-center justify-center text-sm -mr-1 bg-blue-600'>
                          <span className='text-center'>{getInitials(m?.name)}</span>
                        </div>
                        <div>
                          <p className='text-lg font-semibold'>{m?.name}</p>
                          <span className='text-gray-500'>{m?.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sub-Tasks */}
                <div className='space-y-4 py-6'>
                  <p className='text-gray-500 font-semibold text-sm'>SUB-TASKS</p>

                  <div className='space-y-8'>
                    {(task?.subTasksWithPriority || []).map((el, idx) => {
                      // Compute expired state based on deadline date (fallback)
                      const isExpired = isSubtaskExpired(el.deadline);
                      // Debug log for each subtask status
                      console.log(
                        `Subtask: ${el.title}, Deadline: ${el.deadline}, Expired: ${isExpired}, Priority: ${el.priority}`
                      );

                      return (
                        <div key={idx} className='flex gap-3 items-start'>
                          {/* Subtask Icon */}
                          <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-100'>
                            <MdTaskAlt className='text-violet-600' size={26} />
                          </div>

                          {/* Subtask Info */}
                          <div className='space-y-2 w-full'>
                            {/* Subtask Title */}
                            <p className='text-gray-700 font-medium'>{el.title}</p>

                            {/* Assigned Members */}
                            {el.members?.length > 0 ? (
                              <div className='flex gap-2 mt-1 flex-wrap'>
                                {el.members.map((u, i) => (
                                  <span
                                    key={i}
                                    className='text-sm text-white bg-blue-500 px-2 py-1 rounded-full'
                                  >
                                    {u.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className='text-gray-400 text-xs italic mt-1'>
                                No members assigned
                              </p>
                            )}

                            {/* If expired */}
                            {isExpired && (
                              <div className='bg-red-100 border border-red-300 rounded-md p-3 mt-2 flex flex-col'>
                                <p className='text-red-800 text-sm font-semibold'>
                                  ❌ Subtask Expired
                                </p>
                              </div>
                            )}

                            {/* If High Priority and NOT expired */}
                            {!isExpired && el.priority === 'high' && (
                              <div className='bg-yellow-100 border border-yellow-300 rounded-md p-3 mt-2 flex flex-col gap-2'>
                                <p className='text-yellow-800 text-sm'>
                                  ⚠️ Subtask Priority: <strong>High</strong>. Recommended to add users!
                                </p>
                                <button
                                  onClick={() => handleAssignMissingUsers(task._id, el._id, el.priority)}
                                  className='bg-blue-600 text-white px-3 py-1 rounded-md w-max hover:bg-blue-700 transition'
                                >
                                  Assign Free Users
                                </button>
                                <button
                                  onClick={() => handleAutoAssignUsersClick(task._id, el._id, el.priority)}
                                  className='bg-yellow-600 text-white px-3 py-1 rounded-md w-max hover:bg-yellow-700 transition'
                                >
                                  Add Users from Other Tasks
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Documents with Preview */}
              <div className='w-full md:w-1/2 space-y-8'>
                <p className='text-lg font-semibold'>DOCUMENTS</p>
                <div className='w-full flex flex-col gap-4'>
                  {task?.documents?.length > 0 ? (
                    task.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className='p-4 border rounded-md hover:bg-gray-100 transition-all flex items-center justify-between'
                      >
                        <div>
                          <span className='text-blue-600 font-medium'>Document {idx + 1}</span>
                          <div className='text-sm text-gray-500'>{doc.name}</div>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => handlePreviewClick(doc)}
                            className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm'
                          >
                            Preview
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteDocument(doc._id)}
                            className='bg-red-600 text-white px-4 py-2 rounded-md text-sm'
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-400'>No documents uploaded.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Activities id={id} refetch={refetch} />
          )}
        </Tabs>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          <div className='bg-white p-4 rounded-md max-w-3xl w-full relative'>
            <button
              onClick={handleClosePreview}
              className='absolute top-2 right-2 text-red-500 text-lg'
            >
              ×
            </button>
            <h2 className='text-lg font-semibold mb-4'>Document Preview</h2>
            <div className='max-h-[70vh] overflow-auto'>
              {previewDoc.path.match(/\.(jpeg|jpg|png|gif)$/) ? (
                <img src={previewDoc.path} alt={previewDoc.name} className='w-full object-contain' />
              ) : previewDoc.path.endsWith('.pdf') ? (
                <object data={previewDoc.path} type='application/pdf' width='100%' height='600px'>
                  PDF Preview
                </object>
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.path)}&embedded=true`}
                  width='100%'
                  height='600px'
                  frameBorder='0'
                >
                  <p>
                    Cannot preview this file. <a href={previewDoc.path}>Download</a>
                  </p>
                </iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskDetails;