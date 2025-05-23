import React from "react";
import {
  MdAdminPanelSettings,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FaNewspaper, FaUsers } from "react-icons/fa";
import { FaArrowsToDot } from "react-icons/fa6";
import moment from "moment";
import clsx from "clsx";
import { summary } from "../assets/data";
import { Chart } from "../components/Chart";
import { BGS, PRIOTITYSTYELS, TASK_TYPE, getInitials } from "../utils";
import UserInfo from "../components/UserInfo";
import { useGetDashboardStatsQuery } from "../redux/slices/api/taskApiSlice";
import Loading from "../components/Loader";

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
  "Hard work beats talent when talent doesn't work hard. – Tim Notke",
  "Don’t wish it were easier. Wish you were better. – Jim Rohn",
  "The only place where success comes before work is in the dictionary. – Vidal Sassoon",
  "Dreams don’t work unless you do. – John C. Maxwell",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Great things come from hard work and perseverance. – Kobe Bryant",
  "Push yourself, because no one else is going to do it for you.",
  "Success doesn’t just find you. You have to go out and get it.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It’s going to be hard, but hard does not mean impossible.",
  "Don’t wait for opportunity. Create it.",
  "Sometimes we’re tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Believe you can and you’re halfway there. – Theodore Roosevelt",
  "Failure is the condiment that gives success its flavor. – Truman Capote",
  "Don’t limit your challenges. Challenge your limits.",
  "It always seems impossible until it’s done. – Nelson Mandela",
  "Success is what happens after you have survived all your mistakes.",
  "The secret of getting ahead is getting started. – Mark Twain",
  "You don’t have to be great to start, but you have to start to be great.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Work hard in silence, let success make the noise.",
  "The harder you work, the luckier you get.",
  "Opportunities don’t happen. You create them.",
  "Don’t count the days, make the days count. – Muhammad Ali",
  "Success is not for the lazy.",
  "Good things come to those who hustle.",
  "Stop doubting yourself. Work hard and make it happen.",
  "Your limitation—it’s only your imagination.",
  "Greatness only comes before hustle in the dictionary.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Success isn’t owned. It’s leased. And rent is due every day.",
  "Success is no accident. It’s hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.",
  "The road to success is dotted with many tempting parking spaces.",
  "Don’t be afraid to give up the good to go for the great.",
  "Work until your idols become your rivals.",
  "Success is a journey, not a destination.",
  "Hard work spotlights the character of people: some turn up their sleeves, some turn up their noses, and some don’t turn up at all.",
  "Dream big and dare to fail.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "Success usually comes to those who are too busy to be looking for it.",
  "Don’t wait for the perfect moment, take the moment and make it perfect.",
  "Do the hard jobs first. The easy jobs will take care of themselves.",
  "If you believe it will work out, you’ll see opportunities. If you believe it won’t, you will see obstacles.",
  "Success is walking from failure to failure with no loss of enthusiasm. – Winston Churchill",
  "The best way to get something done is to begin.",
  "Push yourself because no one else is going to do it for you.",
  "There are no shortcuts to any place worth going.",
  "Don’t wish for it. Work for it.",
  "Don’t stop until you’re proud.",
  "Failure will never overtake me if my determination to succeed is strong enough.",
  "Your passion is waiting for your courage to catch up.",
  "Sometimes later becomes never. Do it now.",
  "Success isn’t always about greatness. It’s about consistency.",
  "Work hard. Be kind. Amazing things will happen.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "The expert in anything was once a beginner.",
  "You don’t need to be perfect to inspire others. Let people get inspired by how you deal with your imperfections.",
  "Do something today that your future self will thank you for.",
  "Small daily improvements over time lead to stunning results.",
  "Don’t let what you cannot do interfere with what you can do.",
  "Hard work pays off.",
  "Great things never come from comfort zones.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Dream it. Wish it. Do it.",
  "Stay positive, work hard, make it happen.",
  "Success is the result of preparation, hard work, and learning from failure.",
  "Make each day your masterpiece.",
  "Success is not for the lazy.",
  "You have to believe in yourself when no one else does.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Be stronger than your strongest excuse.",
  "The secret of getting ahead is getting started.",
  "If you want to achieve greatness stop asking for permission.",
  "Your only limit is your mind.",
  "Don’t quit. Suffer now and live the rest of your life as a champion.",
  "You don’t have to be great to start, but you have to start to be great.",
  "Success is no accident. It is hard work and perseverance.",
  "Hard work beats talent when talent doesn’t work hard.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Success is what comes after you stop making excuses.",
  "Failure is not the opposite of success; it’s part of success.",
  "You are capable of more than you know.",
  "Don’t limit your challenges, challenge your limits.",
  "Work hard, be kind, and amazing things will happen.",
  "Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Work until your idols become your rivals.",
  "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway.",
];


const TaskTable = ({ tasks }) => {
  const ICONS = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    low: <MdKeyboardArrowDown />,
  };

  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Task Title</th>
        <th className="py-2">Priority</th>
        <th className="py-2">Team</th>
        <th className="py-2">Deadline</th>
      </tr>
    </thead>
  );

  const TableRow = ({ task }) => (
    <tr className="border-b border-gray-300 text-gray-600 hover:bg-gray-300/10">
      <td className="py-2">
        <div className="flex items-center gap-2">
          <div className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])} />
          <p className="text-base text-black">{task.title}</p>
        </div>
      </td>
      <td className="py-2">
        <div className="flex gap-1 items-center">
          <span className={clsx("text-lg", PRIOTITYSTYELS[task.priority])}>
            {ICONS[task.priority]}
          </span>
          <span className="capitalize">{task.priority}</span>
        </div>
      </td>
      <td className="py-2">
        <div className="flex">
          {task.team.map((m, index) => (
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
        <span className="text-base text-gray-600">
          {moment(task?.deadline).format("MMM D, YYYY")}
        </span>
      </td>
    </tr>
  );

  return (
    <div className="w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-md rounded">
      <table className="w-full">
        <TableHeader />
        <tbody>
          {tasks?.map((task, id) => (
            <TableRow key={id} task={task} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const UserTable = ({ users }) => {
  const TableHeader = () => (
    <thead className="border-b border-gray-300">
      <tr className="text-black text-left">
        <th className="py-2">Full Name</th>
        <th className="py-2">Role</th>
        <th className="py-2">Created At</th>
      </tr>
    </thead>
  );

  const TableRow = ({ user }) => (
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
      <td className="py-2 px-3">
        <p className="text-sm">{moment(user?.createdAt).format("MMM D, YYYY")}</p>
      </td>
    </tr>
  );

  return (
    <div className="w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-md rounded">
      <table className="w-full mb-5">
        <TableHeader />
        <tbody>
          {users?.map((user, index) => (
            <TableRow key={index + user?._id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  if (isLoading)
    return (
      <div className="py-10">
        <Loading />
      </div>
    );

  const totals = data?.tasks;
  const groupedByStage = {
    todo: totals["todo"] || 0,
    inProgress: totals["in progress"] || 0,
    completed: totals["completed"] || 0,
    overdue: totals["overdue"] || totals["Overdue"] || 0,
  };

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASK",
      total: data?.totalTasks || 0,
      icon: <FaNewspaper />,
      bg: "bg-[#1d4ed8]",
    },
    {
      _id: "2",
      label: "COMPLETED TASK",
      total: groupedByStage.completed || 0,
      icon: <MdAdminPanelSettings />,
      bg: "bg-[#0f766e]",
    },
    {
      _id: "3",
      label: "TASK IN PROGRESS ",
      total: groupedByStage.inProgress || 0,
      icon: <MdEdit />,
      bg: "bg-[#f59e0b]",
    },
    {
      _id: "4",
      label: "TODO TASKS",
      total: groupedByStage.todo || 0,
      icon: <FaArrowsToDot />,
      bg: "bg-[#be185d]",
    },
    {
      _id: "5",
      label: "OVERDUE TASKS",
      total: groupedByStage.overdue || 0,
      icon: <MdKeyboardArrowDown />,
      bg: "bg-[#dc2626]",
    },
  ];

  const Card = ({ label, count, bg, icon }) => {
    return (
      <div className="w-full h-32 bg-white p-5 shadow-md rounded-md flex items-center justify-between">
        <div className="h-full flex flex-1 flex-col justify-between">
          <p className="text-base text-gray-600">{label}</p>
          <span className="text-2xl font-semibold">{count}</span>
          <span className="text-sm text-gray-400">
            Until {new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </span>
        </div>
        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-white", bg)}>
          {icon}
        </div>
      </div>
    );
  };

  const chartData = [
    { label: "Todo", value: groupedByStage.todo },
    { label: "In Progress", value: groupedByStage.inProgress },
    { label: "Completed", value: groupedByStage.completed },
    { label: "Overdue", value: groupedByStage.overdue },
  ];

  return (
    <div className="h-full py-4">
      {/* Quote */}
      <div className="bg-white shadow-sm p-4 rounded mb-6">
        <p className="text-lg italic text-center text-gray-600">
          “{randomQuote}”
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map(({ icon, bg, label, total }, index) => (
          <Card key={index} icon={icon} bg={bg} label={label} count={total} />
        ))}
      </div>

      {/* Chart */}
      <div className="w-full bg-white my-16 p-4 rounded shadow-sm">
        <h4 className="text-xl text-gray-600 font-semibold">Chart by Stage</h4>
        <Chart data={chartData} />
      </div>

      {/* Tables */}
      <div className="w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-8">
        <TaskTable tasks={data?.last10Task} />
        <UserTable users={data?.users} />
      </div>
    </div>
  );
};

export default Dashboard;
