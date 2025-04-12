import React from 'react';
import {
  MdDashboard,
  MdOutlineAddTask,
  MdOutlinePendingActions,
  MdTaskAlt,
} from "react-icons/md";
import { FaTasks, FaTrashAlt, FaUsers } from "react-icons/fa";
import { BiTimeFive } from "react-icons/bi";
import { RiErrorWarningLine } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/sidebarSlice";
import { Link } from "react-router-dom";

const linkData = [
  {
    label: "Dashboard",
    link: "dashboard",
    icon: <MdDashboard />,
  },
  {
    label: "Tasks",
    link: "tasks",
    icon: <FaTasks />,
  },
  {
    label: "Completed",
    link: "completed/completed",
    icon: <MdTaskAlt />,
  },
  {
    label: "In Progress",
    link: "in-progress/in progress",
    icon: <BiTimeFive />,
  },
  {
    label: "To Do",
    link: "todo/todo",
    icon: <MdOutlinePendingActions />,
  },
  {
    label: "Users",
    link: "users",
    icon: <FaUsers />,
  },
  {
    label: "Trash",
    link: "trashed",
    icon: <FaTrashAlt />,
  },
];

const Sidebar = () => {
  const authState = useSelector((state) => state.auth) || {};
  const { user } = authState;

  const dispatch = useDispatch();
  const location = useLocation();

  const path = location.pathname.split("/")[1];

  let sidebarLinks = [...linkData];

  if (user?.isAdmin) {
    sidebarLinks.splice(5, 0, {
      label: "Overdue",
      link: "overdue/overdue",
      icon: <RiErrorWarningLine />,
    });
  } else {
    sidebarLinks = linkData.slice(0, 5);
  }

  const closeSidebar = () => {
    dispatch(setOpenSidebar(false));
  };

  const NavLink = ({ el }) => {
    return (
      <Link
        to={el.link}
        onClick={closeSidebar}
        className={`w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#2564ed2d] 
          ${path === el.link.split("/")[0] ? "bg-blue-700 text-neutral-100" : ""}`}
      >
        {el.icon}
        <span className='hover:text-[#2564ed]'>{el.label}</span>
      </Link>
    );
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 p-5'>
      <h1 className='flex gap-1 items-center'>
        <p className='bg-blue-600 p-2 rounded-full'>
          <MdOutlineAddTask className='text-white text-2xl font-black' />
        </p>
        <span className='text-2xl font-bold text-black'>
          Welcome back, {user?.name?.split(" ")[0].toUpperCase() || "USER"}
        </span>
      </h1>

      <div className='flex-1 flex flex-col gap-y-5 py-8'>
        {sidebarLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
