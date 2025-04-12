import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { useUpdateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import UserInfo from "../UserInfo";

const EditSubTask = ({ open, setOpen, subTask, team = [] }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: subTask?.title || "",
      deadline: subTask?.deadline?.slice(0, 10) || "",
      priority: subTask?.priority || "low",
      tag: subTask?.tag || "",
      members: subTask?.members?.map((m) => m._id) || [],
    },
  });

  const selectedMembers = watch("members");
  const [updateSubTask] = useUpdateSubTaskMutation();

  const toggleMember = (memberId) => {
    const updated = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    setValue("members", updated);
  };

  const handleOnSubmit = async (data) => {
    try {
      // Ensure the correct data structure is passed
      const subtaskData = {
        title: data.title,
        deadline: data.deadline,
        priority: data.priority,
        tag: data.tag,
        members: data.members, // The array of member IDs
      };
      console.log(subTask._id);
      // Correct API mutation for update
      const response = await updateSubTask({ id: subTask._id, data: subtaskData }).unwrap();
      
      if (response) {
        toast.success("Subtask updated successfully!");
        setTimeout(() => setOpen(false), 500);
      }
    }catch (error) {
        console.error("Update failed:", error?.data || error?.message || error);
        toast.error("Failed to update subtask.");
      }
      
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          EDIT SUB-TASK
        </Dialog.Title>

        <div className="mt-2 flex flex-col gap-6">
          <Textbox
            placeholder="Sub-Task title"
            type="text"
            name="title"
            label="Title"
            className="w-full rounded"
            register={register("title", {
              required: "Title is required!",
            })}
            error={errors.title?.message}
          />

          <div className="flex items-center gap-4">
            <Textbox
              placeholder="Deadline"
              type="date"
              name="deadline"
              label="Deadline"
              className="w-full rounded"
              register={register("deadline", {
                required: "Deadline is required!",
              })}
              error={errors.deadline?.message}
            />
            <Textbox
              placeholder="Tag"
              type="text"
              name="tag"
              label="Tag"
              className="w-full rounded"
              register={register("tag", {
                required: "Tag is required!",
              })}
              error={errors.tag?.message}
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                {...register("priority", { required: "Priority is required!" })}
                className="border border-gray-300 rounded w-full p-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              {errors.priority && (
                <p className="text-red-500 text-sm">{errors.priority.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Members
            </label>
            {team.length === 0 ? (
              <p className="text-sm text-gray-500">
                No team members assigned to this task.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {team.map((member) => (
                  <label key={member._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                    />
                    <div className="flex items-center gap-2">
                      <UserInfo user={member} />
                      <span className="text-sm text-gray-800">
                        {member.fullName}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="py-3 mt-4 flex sm:flex-row-reverse gap-4">
          <Button
            type="submit"
            className="bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto"
            label="Update Subtask"
          />
          <Button
            type="button"
            className="bg-white border text-sm font-semibold text-gray-900 sm:w-auto"
            onClick={() => setOpen(false)}
            label="Cancel"
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default EditSubTask;
