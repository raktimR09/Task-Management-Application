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
  useDeleteTaskDocumentMutation,
  useGetSingleTaskQuery,
  usePostTaskActivityMutation,
} from "../redux/slices/api/taskApiSlice";

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

const TaskDetails = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetSingleTaskQuery({ id });
  const [selected, setSelected] = useState(0);
  const [deleteTaskDocument] = useDeleteTaskDocumentMutation(); // Mutation for document deletion
  const [previewDoc, setPreviewDoc] = useState(null);
  const task = data?.task;

  const handleCompleteSubTask = async (subtaskId) => {
    try {
      const response = await updateCompletionSubTask({ taskId: id, subtaskId }).unwrap();
      toast.success(response?.message || "Subtask marked as completed");
      refetch();
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark subtask as completed");
    }
  };

  const handlePreviewClick = (doc) => setPreviewDoc(doc);
  const handleClosePreview = () => setPreviewDoc(null);

  const handleDeleteDocument = async (docId) => {
    try {
      // Delete document via the API
      const response = await deleteTaskDocument({ taskId: id, docId }).unwrap();
      toast.success(response.message);

      // Optimistically update the UI by refetching the task
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
                  <div className={clsx("flex gap-1 items-center text-base font-semibold px-3 py-1 rounded-full", PRIOTITYSTYELS[task?.priority], bgColor[task?.priority])}>
                    <span className='text-lg'>{ICONS[task?.priority]}</span>
                    <span className='uppercase'>{task?.priority} Priority</span>
                  </div>
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
                      <div key={index} className='flex gap-4 py-2 items-center border-t border-gray-200'>
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
                    {task?.subTasks?.map((el, index) => (
                      <div key={index} className='flex gap-3 items-start'>
                        <div className='w-10 h-10 flex items-center justify-center rounded-full bg-violet-100'>
                          <MdTaskAlt className='text-violet-600' size={26} />
                        </div>
                        <div className='space-y-1 w-full'>
                          <div className='flex gap-2 items-center justify-between flex-wrap'>
                            <div className='flex items-center gap-3'>
                              <span className='text-sm text-gray-500'>
                                {moment(el?.date).format("MMM Do YYYY")}
                              </span>
                              <span className='px-2 py-0.5 text-sm rounded-full bg-violet-100 text-violet-700 font-semibold'>
                                {el?.tag}
                              </span>
                            </div>

                            {el?.assignedUsers?.some((u) => u?._id === user?._id) && (
                              <div className='flex items-center gap-2'>
                                <input
                                  type='checkbox'
                                  id={`subtask-${el._id}`}
                                  checked={el?.isCompleted}
                                  onChange={() => handleCompleteSubTask(el._id)}
                                  disabled={el?.isCompleted}
                                  className='w-4 h-4 cursor-pointer accent-green-600'
                                />
                                <label
                                  htmlFor={`subtask-${el._id}`}
                                  className={clsx(
                                    'text-sm font-medium',
                                    el?.isCompleted ? 'text-green-600 line-through' : 'text-gray-800'
                                  )}
                                >
                                  {el?.isCompleted ? 'Completed' : 'Mark as Completed'}
                                </label>
                              </div>
                            )}
                          </div>
                          <p className='text-gray-700'>{el?.title}</p>
                          <div className='flex gap-2 mt-1 flex-wrap'>
                            {el?.assignedUsers?.map((u, idx) => (
                              <span
                                key={idx}
                                className='text-xs text-white bg-blue-500 px-2 py-1 rounded-full'
                              >
                                {u?.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
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
                          <span className='text-blue-600 font-medium'>
                            Document {idx + 1}
                          </span>
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
            <Activities activity={task?.activities} id={id} refetch={refetch} />
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
            >×</button>
            <h2 className='text-lg font-semibold mb-4'>Document Preview</h2>
            <div className='max-h-[70vh] overflow-auto'>
              {previewDoc.path.match(/\.(jpeg|jpg|png|gif)$/) ? (
                <img src={previewDoc.path} alt={previewDoc.name} className='w-full object-contain' />
              ) : previewDoc.path.endsWith('.pdf') ? (
                <object data={previewDoc.path} type='application/pdf' width='100%' height='600px'>PDF Preview</object>
              ) : (
                <iframe
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(previewDoc.path)}&embedded=true`}
                  width='100%' height='600px' frameBorder='0'
                >
                  <p>Cannot preview this file. <a href={previewDoc.path}>Download</a></p>
                </iframe>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const Activities = ({ activity, id, refetch }) => {
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState(act_types[0]);
  const [text, setText] = useState("");
  const [postActivity, { isLoading }] = usePostTaskActivityMutation();
  const { data } = useGetSingleTaskQuery({ id });
  const isAssignedUser = data?.task?.team?.some((member) => member?._id === user?._id);

  const handleSubmit = async () => {
    try {
      const activityData = { type: selected.toLowerCase(), activity: text };
      const result = await postActivity({ data: activityData, id }).unwrap();
      setText(""); toast.success(result?.message); refetch();
    } catch (error) {
      console.log(error); toast.error("Something went wrong!");
    }
  };

  const Card = ({ item }) => (
    <div className='flex space-x-4'>
      <div className='flex flex-col items-center flex-shrink-0'>
        <div className='w-10 h-10 flex items-center justify-center'>{TASKTYPEICON[item?.type]}</div>
        <div className='w-full flex items-center'><div className='w-0.5 bg-gray-300 h-full'></div></div>
      </div>
      <div className='flex flex-col gap-y-1 mb-8'>
        <p className='font-semibold'>{item?.by?.name}</p>
        <div className='text-gray-500 space-y-1'>
          <span className='capitalize block'>{item?.type}</span>
          <span className='text-sm text-gray-400'>{moment(item?.date).format("MMMM Do YYYY, h:mm A")}</span>
        </div>
        <div className='text-gray-700'>{item?.activity}</div>
      </div>
    </div>
  );

  return (
    <div className='w-full flex gap-10 2xl:gap-20 min-h-screen px-10 py-8 bg-white shadow rounded-md justify-between overflow-y-auto'>
      <div className='w-full md:w-1/2'>
        <h4 className='text-gray-600 font-semibold text-lg mb-5'>Activities</h4>
        <div className='w-full'>
          {activity?.slice(1).map((el, idx) => <Card key={idx} item={el}/>)}
        </div>
      </div>
      {isAssignedUser && (
        <div className='w-full md:w-1/3'>
          <h4 className='text-gray-600 font-semibold text-lg mb-5'>Add Activity</h4>
          <div className='w-full flex flex-wrap gap-5'>
            {act_types.map(item => (
              <div key={item} className='flex gap-2 items-center'>
                <input type='checkbox' className='w-4 h-4' checked={selected===item} onChange={()=>setSelected(item)} />
                <p>{item}</p>
              </div>
            ))}
            <textarea rows={10} value={text} onChange={e=>setText(e.target.value)} placeholder='Type ......' className='bg-white w-full mt-10 border border-gray-300 outline-none p-4 rounded-md focus:ring-2 ring-blue-500' />
            {isLoading ? <Loading/> : <Button type='button' label='Submit' onClick={handleSubmit} className='bg-blue-600 text-white rounded'/>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;