import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import ModalWrapper from "../ModalWrapper";
import Button from "../Button";
import { useUploadTaskDocumentsMutation } from "../../redux/slices/api/taskApiSlice";
import { toast } from "sonner";

const UploadDocument = ({ open, setOpen, taskId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploadTaskDocuments] = useUploadTaskDocumentsMutation();

  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  const handleUpload = async () => {
    if (!taskId || documents.length === 0) {
      toast.error("Please select files and ensure a valid task.");
      return;
    }

    const formData = new FormData();
    documents.forEach((doc) => formData.append("documents", doc));

    try {
      await uploadTaskDocuments({ taskId, formData }).unwrap();
      toast.success("Documents uploaded successfully!");
      setOpen(false);
      setDocuments([]);
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload documents.");
    }
  };

  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <Dialog.Title
        as="h2"
        className="text-base font-bold leading-6 text-gray-900 mb-4"
      >
        Upload Documents
      </Dialog.Title>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Files
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-2 w-full text-sm"
          />
        </div>

        <div className="bg-gray-50 pt-4 sm:flex sm:flex-row-reverse gap-4">
          <Button
            label="Upload"
            type="button"
            onClick={handleUpload}
            className="bg-blue-600 px-6 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
          />
          <Button
            label="Cancel"
            type="button"
            onClick={() => setOpen(false)}
            className="bg-white px-6 text-sm font-semibold text-gray-900 sm:w-auto"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default UploadDocument;
