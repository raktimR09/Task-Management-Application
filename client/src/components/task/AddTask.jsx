import React, { useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import { useForm } from "react-hook-form";
import UserList from "./UserList";
import SelectList from "../SelectList";
import Button from "../Button";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
} from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import { dateFormatter } from "../../utils";

const LISTS = ["TODO", "IN PROGRESS", "COMPLETED"];

const AddTask = ({ open, setOpen, task }) => {
  const defaultValues = {
    title: task?.title || "",
    deadline: dateFormatter(task?.deadline || new Date()),
    team: [],
    stage: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const [team, setTeam] = useState(task?.team || []);
  const [stage, setStage] = useState(task?.stage?.toUpperCase() || LISTS[0]);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  const submitHandler = async (data) => {
    try {
      const newData = {
        ...data,
        deadline: new Date(data.deadline),
        team,
        stage,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      toast.success(task?._id ? "Task updated successfully!" : "Task created successfully!");

      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <Dialog.Title
            as='h2'
            className='text-base font-bold leading-6 text-gray-900 mb-4'
          >
            {task ? "UPDATE TASK" : "ADD TASK"}
          </Dialog.Title>

          <div className='mt-2 flex flex-col gap-6'>
            <Textbox
              placeholder='Task Title'
              type='text'
              name='title'
              label='Task Title'
              className='w-full rounded'
              register={register("title", { required: "Title is required" })}
              error={errors.title ? errors.title.message : ""}
            />

            <UserList setTeam={setTeam} team={team} />

            <div className='flex gap-4'>
              <SelectList
                label='Task Stage'
                lists={LISTS}
                selected={stage}
                setSelected={setStage}
              />

              <Textbox
                placeholder='Deadline'
                type='date'
                name='deadline'
                label='Deadline'
                className='w-full rounded'
                register={register("deadline", {
                  required: "Deadline is required!",
                })}
                error={errors.deadline ? errors.deadline.message : ""}
              />
            </div>

            <div className='bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4'>
              <Button
                label='Submit'
                type='submit'
                className='bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700  sm:w-auto'
              />

              <Button
                type='button'
                className='bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto'
                onClick={() => setOpen(false)}
                label='Cancel'
              />
            </div>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddTask;
