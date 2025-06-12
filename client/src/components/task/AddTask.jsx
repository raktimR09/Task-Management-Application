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
  useUploadTaskDocumentsMutation,
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
  const [documents, setDocuments] = useState([]);

  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [uploadTaskDocuments] = useUploadTaskDocumentsMutation();

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const submitHandler = async (data) => {
    try {
      const newData = {
        ...data,
        date: new Date(data.deadline),
        team,
        stage,
      };

      const res = task?._id
        ? await updateTask({ ...newData, _id: task._id }).unwrap()
        : await createTask(newData).unwrap();

      const taskId = task?._id || res._id;

      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach((doc) => formData.append("documents", doc));

        try {
          await uploadTaskDocuments({ taskId, formData }).unwrap();
          toast.success("Documents uploaded successfully!");
          console.log("Document Uploaded");
        } catch (uploadError) {
          console.error("Document upload failed:", uploadError);
          toast.error("Failed to upload documents.");
        }
      }

      toast.success(task?._id ? "Project updated successfully!" : "Project created successfully!");
      setTimeout(() => {
        setOpen(false);               // Close the modal
        window.location.reload();     // Refresh the page
      }, 500);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(submitHandler)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          {task ? "UPDATE PROJECT" : "ADD PROJECT"}
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Project Title"
            type="text"
            name="title"
            label="Project Title"
            className="w-full rounded"
            register={register("title", { required: "Title is required" })}
            error={errors.title ? errors.title.message : ""}
          />

          <UserList setTeam={setTeam} team={team} />

          <div className="flex gap-4">
            <SelectList
              label="Project Stage"
              lists={LISTS}
              selected={stage}
              setSelected={setStage}
            />

            <Textbox
              placeholder="Deadline"
              type="date"
              name="deadline"
              label="Deadline"
              className="w-full rounded"
              register={register("deadline", {
                required: "Deadline is required!",
              })}
              error={errors.deadline ? errors.deadline.message : ""}
            />
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attach Documents
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mt-2 w-full text-sm"
            />
          </div>

          <div className="bg-gray-50 py-6 sm:flex sm:flex-row-reverse gap-4">
            <Button
              label="Submit"
              type="submit"
              className="bg-blue-600 px-8 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
            />

            <Button
              type="button"
              className="bg-white px-5 text-sm font-semibold text-gray-900 sm:w-auto"
              onClick={() => setOpen(false)}
              label="Cancel"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default AddTask;
