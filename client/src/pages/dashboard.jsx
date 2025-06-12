import React, { useState } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import moment from "moment";
import clsx from "clsx";
import { Chart } from "../components/Chart";
import {
  BGS,
  PRIOTITYSTYELS,
  TASK_TYPE,
  getInitials,
} from "../utils";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import Loading from "../components/Loader";
import UserInfo from "../components/UserInfo";

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();
  const [selectedTaskId, setSelectedTaskId] = useState("");

  if (isLoading || !data) return <Loading />;

  const allTasks = data.allTasks || [];
  const selectedTask = allTasks.find((task) => task._id === selectedTaskId);
  const subtasks = selectedTask?.subTasks||[];

  const groupedByStage = {
    todo: subtasks.filter((s) => s.stage === "todo").length,
    inProgress: subtasks.filter((s) => s.stage === "in progress").length,
    completed: subtasks.filter((s) => s.stage === "completed").length,
    overdue: subtasks.filter((s) => s.stage === "overdue").length,
  };

  const chartData = [
    { label: "Todo", value: groupedByStage.todo },
    { label: "In Progress", value: groupedByStage.inProgress },
    { label: "Completed", value: groupedByStage.completed },
    { label: "Overdue", value: groupedByStage.overdue },
  ];

  const quotes = [
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "Hard work beats talent when talent doesn't work hard. – Tim Notke",
    "Don’t wish it were easier. Wish you were better. – Jim Rohn",
    "The only place where success comes before work is in the dictionary. – Vidal Sassoon",
    "Dreams don’t work unless you do. – John C. Maxwell",
    "Wake up with determination. Go to bed with satisfaction.",
    "Push yourself, because no one else is going to do it for you.",
    "Don’t stop when you’re tired. Stop when you’re done.",
    "Success doesn’t just find you. You have to go out and get it.",
    "Believe you can and you’re halfway there. – Theodore Roosevelt",
  ];
  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  const TaskSelector = () => (
    <div className="mb-6">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select a Project:
      </label>
      <select
        value={selectedTaskId}
        onChange={(e) => setSelectedTaskId(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="" disabled>
          -- Choose a Project --
        </option>
        {allTasks.map((task) => (
          <option key={task._id} value={task._id}>
            {task.title}
          </option>
        ))}
      </select>
    </div>
  );

  const TaskTable = () => (
  <div className="w-full md:w-2/3 bg-white px-4 pt-4 pb-4 shadow-md rounded">
    <table className="w-full">
      <thead className="border-b border-gray-300">
        <tr className="text-left text-black">
          <th className="py-2">Task Title</th>
          <th className="py-2">Priority</th>
          <th className="py-2">Team</th>
          <th className="py-2">Deadline</th>
        </tr>
      </thead>
      <tbody>
        {subtasks.map((subtask, idx) => (
          <tr key={idx} className="border-b text-gray-600 hover:bg-gray-300/10">
            <td className="py-2">
              <div className="flex items-center gap-2">
        <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[subtask.stage])} />
        <p className="text-base text-black">{subtask.title}</p>
      </div>
            </td>
            <td className="py-2 capitalize">
              <div className="flex gap-1 items-center">
                <span className={clsx("text-lg", PRIOTITYSTYELS[subtask.priority])}>
                  {{
                    high: <MdKeyboardDoubleArrowUp />,
                    medium: <MdKeyboardArrowUp />,
                    low: <MdKeyboardArrowDown />,
                  }[subtask.priority]}
                </span>
                {subtask.priority}
              </div>
            </td>
            <td className="py-2">
              <div className="flex">
                {subtask.members?.map((m, index) => (
                  <div
                    key={index}
                    className={clsx(
                      "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                      BGS[index % BGS.length]
                    )}
                  >
                    <UserInfo user={m} />
                  </div>
                ))}
              </div>
            </td>
            <td className="py-2">
              {moment(subtask.deadline).format("MMM D, YYYY")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);


  const UserTable = () => (
    <div className="w-full md:w-1/3 bg-white px-4 py-4 shadow-md rounded">
      <table className="w-full">
        <thead className="border-b border-gray-300">
          <tr className="text-left text-black">
            <th className="py-2">Full Name</th>
          <th className="py-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {selectedTask?.team?.map((user, idx) => (
            <tr className="border-b border-gray-200 text-gray-800 hover:bg-gray-400/10">
      <td className="py-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-700">
            <span className="text-center">{getInitials(user?.name)}</span>
          </div>
          <div>
            <p>{user.name}</p>
          </div>
        </div>
      </td>
      <td className="py-2 px-2">
        <p className="text-sm">{user?.role}</p>
      </td>
  
    </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="h-full py-4">
      <div className="bg-white shadow-sm p-4 rounded mb-6">
        <p className="text-lg italic text-center text-gray-600">“{quote}”</p>
      </div>

      <TaskSelector />

      {selectedTaskId && (
        <>
          <div className="bg-white my-6 p-4 rounded shadow-sm">
            <h4 className="text-xl text-gray-600 font-semibold">Subtasks by Stage</h4>
            <Chart data={chartData} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 2xl:gap-10 py-8">
            <TaskTable />
            <UserTable />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
