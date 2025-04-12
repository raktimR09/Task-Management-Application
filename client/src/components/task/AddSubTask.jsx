import { useForm } from "react-hook-form";
import ModalWrapper from "../ModalWrapper";
import { Dialog } from "@headlessui/react";
import Textbox from "../Textbox";
import Button from "../Button";
import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";
import UserInfo from "../UserInfo";

const AddSubTask = ({ open, setOpen, id, team = [] }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      members: [],
      priority: "low",
    },
  });

  const [addSbTask] = useCreateSubTaskMutation();

  const handleOnSubmit = async (data) => {
    if (!id) {
      toast.error("Task ID is missing. Please try again.");
      return;
    }

    try {
      const res = await addSbTask({ data, id }).unwrap();
      toast.success("Subtask added successfully!");
      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error("Something went wrong while adding the subtask.");
    }
  };

  const selectedMembers = watch("members");

  const toggleMember = (memberId) => {
    const updated = selectedMembers.includes(memberId)
      ? selectedMembers.filter((id) => id !== memberId)
      : [...selectedMembers, memberId];
    setValue("members", updated);
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <Dialog.Title
          as="h2"
          className="text-base font-bold leading-6 text-gray-900 mb-4"
        >
          ADD SUB-TASK
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

          {/* Members selector */}
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
            label="Add Subtask"
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

export default AddSubTask;
