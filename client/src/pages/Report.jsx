import React, { useEffect, useRef, useState } from "react";
import { useLazyGetReportTasksQuery } from "../redux/slices/api/taskApiSlice";
import clsx from "clsx";

// Task stage color mapping
const TASK_STAGE_COLORS = {
  todo: "bg-yellow-400",
  "in progress": "bg-blue-400",
  completed: "bg-green-400",
  overdue: "bg-red-400",
};

const Report = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trigger, { data, isLoading, error }] = useLazyGetReportTasksQuery();

  const tableRef = useRef();

  useEffect(() => {
    // Fetch all tasks on initial load
    trigger({});
  }, []);

  const handleFilter = () => {
    console.log("Button clicked");
    console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
    trigger({ startDate, endDate });
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printContent = tableRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Refresh after print
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Task Report</h2>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
        </div>

        <button
          onClick={handleFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Filter
        </button>

        <button
          onClick={handlePrint}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          Print Report
        </button>
      </div>

      {/* Content */}
      <div ref={tableRef}>
        {isLoading && <p className="text-gray-500">Loading tasks...</p>}

        {error && (
          <p className="text-red-500">
            {error?.data?.message || "Failed to load task report."}
          </p>
        )}

        {!isLoading && !error && data?.tasks?.length === 0 && (
          <p className="text-gray-600">No tasks available in the report.</p>
        )}

        {!isLoading && !error && data?.tasks?.length > 0 && (
          <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-300">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-100">
  <tr>
    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Project Title</th>
    <th className="px-6 py-3 text-sm font-semibold text-gray-700">No. of Tasks</th>
    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Start Date</th>
    <th className="px-6 py-3 text-sm font-semibold text-gray-700">End Date</th>
    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
    <th className="px-6 py-3 text-sm font-semibold text-gray-700">Priority</th>
  </tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {data.tasks.map((task) => (
    <tr key={task._id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
        {task.title}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {task.subTasks?.filter((subtask) => !subtask.isTrashed).length || 0}
</td>

      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {task.createdAt
    ? new Date(task.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {task.deadline
    ? new Date(task.deadline).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A"}
</td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "w-3 h-3 rounded-full",
              TASK_STAGE_COLORS[task.stage] || "bg-gray-300"
            )}
          />
          <span className="capitalize text-gray-700 text-sm">
            {task.stage || "N/A"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-700">
        {task.priority || "Normal"}
      </td>
    </tr>
  ))}
</tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
