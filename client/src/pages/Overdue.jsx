import React, { useState, useMemo } from "react";
import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import Loading from "../components/Loader";
import Title from "../components/Title";
import Tabs from "../components/Tabs";
import TaskTitle from "../components/TaskTitle";
import BoardView from "../components/BoardView";
import Table from "../components/task/Table";
import { useGetAlltaskQuery } from "../redux/slices/api/taskApiSlice";

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Overdue = () => {
  const [selected, setSelected] = useState(0);

  const { data, isLoading } = useGetAlltaskQuery({
    strQuery: "",       // Get all tasks
    isTrashed: "",      // Not in trash
    search: "",         // No search filter
  });

  // Filter tasks that are overdue (dueDate < today)
  const overdueTasks = useMemo(() => {
    if (!data?.tasks) return [];

    const now = new Date();
    return data.tasks.filter(task => {
      const dueDate = new Date(task?.dueDate);
      return dueDate < now && task?.status !== "completed";
    });
  }, [data]);

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title="Overdue Tasks" />
      </div>

      <Tabs tabs={TABS} setSelected={setSelected}>
        <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
          <TaskTitle label="Overdue" className="bg-red-600" />
        </div>

        {selected !== 1 ? (
          <BoardView tasks={overdueTasks} />
        ) : (
          <div className="w-full">
            <Table tasks={overdueTasks} />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Overdue;
