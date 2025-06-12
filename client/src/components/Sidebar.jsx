import React, { useState } from 'react';
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
import { useLocation, Link } from "react-router-dom";
import { setOpenSidebar } from "../redux/slices/sidebarSlice";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth) || {};
  const dispatch = useDispatch();
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const [showStages, setShowStages] = useState(false);

  const closeSidebar = () => dispatch(setOpenSidebar(false));

  const NavLink = ({ el, isChild }) => (
    <Link
      to={el.link}
      onClick={closeSidebar}
      className={`w-full flex gap-2 px-3 py-2 rounded-full items-center text-gray-800 text-base hover:bg-[#2564ed2d] ${
        path === el.link.split("/")[0] ? "bg-blue-700 text-neutral-100" : ""
      } ${isChild ? "ml-6 text-sm" : "lg:w-3/4"}`}
    >
      {el.icon}
      <span className='hover:text-[#2564ed]'>{el.label}</span>
    </Link>
  );

  const baseLinks = [
    { label: "Dashboard", link: "dashboard", icon: <MdDashboard /> },
    { label: "Projects", link: "tasks", icon: <FaTasks /> },
  ];

  const adminLinks = [
    { label: "Members", link: "users", icon: <FaUsers /> },
    { label: "Trash", link: "trashed", icon: <FaTrashAlt /> },
  ];

  const stageLinks = [
    { label: "To Do", link: "todo/todo", icon: <MdOutlinePendingActions /> },
    { label: "In Progress", link: "in-progress/in progress", icon: <BiTimeFive /> },
    { label: "Completed", link: "completed/completed", icon: <MdTaskAlt /> },
    { label: "Overdue", link: "overdue/overdue", icon: <RiErrorWarningLine /> },
  ];

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
        {/* Always visible: Dashboard & Projects */}
        {baseLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}

        {/* Now visible to all users */}
        <button
          onClick={() => setShowStages((prev) => !prev)}
          className={`w-full lg:w-3/4 flex justify-between items-center gap-2 px-3 py-2 rounded-full text-gray-800 text-base hover:bg-[#2564ed2d]`}
        >
          <div className='flex items-center gap-2'>
            <BiTimeFive />
            <span className='hover:text-[#2564ed]'>Status</span>
          </div>
          {showStages ? <IoChevronUp /> : <IoChevronDown />}
        </button>

        {showStages && (
          <div className="flex flex-col gap-3">
            {stageLinks.map((stage) => (
              <NavLink el={stage} key={stage.label} isChild />
            ))}
          </div>
        )}

        {/* Admin-only links */}
        {user?.isAdmin && adminLinks.map((link) => (
          <NavLink el={link} key={link.label} />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
