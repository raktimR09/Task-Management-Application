import { apiSlice } from "../apiSlice"

export const taskApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        getDashboardStats: builder.query({
            query:()=>({
                url:`task/dashboard`,
                method:"GET",
                credentials:"include",
            }),
        }),

        getAlltask:builder.query({
            query:({strQuery,isTrashed,search})=>({
                url:`/task?stage=${strQuery}&isTrashed=${isTrashed}&search=${search}`,
                method:"GET",
                credentials:"include",
            })
        }),

        createTask: builder.mutation({
            query:(data)=>({
                url:"/task/create",
                method:"POST",
                body:JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        updateTask: builder.mutation({
            query:(data)=>({
                url:`/task/update/${data._id}`,
                method:"PUT",
                body:JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        duplicateTask: builder.mutation({
            query:(id)=>({
                url:`/task/duplicate/${id}`,
                method:"POST",
                body:{},
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        trashTask: builder.mutation({
            query:({id})=>({
                url:`/task/${id}`,
                method:"PUT",
                credentials:"include",
            }),
            
        }),

        createSubTask: builder.mutation({
        query:({data,id})=>({
                url:`/task/create-subtask/${id}`,
                method:"PUT",
                body:JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        getSingleTask: builder.query({
            query:({id})=>({
                url:`/task/${id}`,
                method:"GET",
                credentials:"include",
            }),
        }),

        postTaskActivity: builder.mutation({
            query:({data,id})=>({
                url:`/task/activity/${id}`,
                method:"POST",
                body:JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        uploadTaskDocuments: builder.mutation({
            query: ({ taskId, formData }) => ({
              url: `/task/upload/${taskId}`,
              method: "POST",
              body: formData,
              credentials: "include",
            }),
          }),

          updateSubTask: builder.mutation({
            query: ({ id, data }) => ({
              url: `/task/update-subtask/${id}`, // Corrected API path
              method: "PUT",
              body: JSON.stringify(data),
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            }),
          }),
          
          deleteSubTask: builder.mutation({
            query: ({ taskId, subtaskId }) => ({
              url: `/task/delete-subtask/${taskId}/${subtaskId}`,  // API path for deleting subtask
              method: "DELETE",
              credentials: "include",
            }),
          }),
          
          

        deleteRestoreTask: builder.mutation({
            query:({id,actionType})=>({
                    url:`/task/delete-restore/${id}?actionType=${actionType}`,
                    method:"DELETE",
                    credentials:"include",
                }),
            }),

        
        deleteTaskDocument: builder.mutation({
            query: ({ taskId, docId }) => ({
                  url: `/task/${taskId}/documents/${docId}`,
                  method: 'DELETE',
            }),
            }),
              
            autoAssignUsersToHighPrioritySubtasks: builder.mutation({
                query: ({ taskId,subtaskId }) => ({
                  url: `/task/auto-assign/${taskId}/${subtaskId}`, // Create this API on the backend
                  method: "POST", // Update method
                  body:{},
                  headers: { "Content-Type": "application/json" },
                  credentials: "include", 
                }),
              }),

              assignMissingUsersToHighPrioritySubtasks: builder.mutation({
                query: ({ taskId,subtaskId }) => ({
                  url: `/task/assign-missing-high/${taskId}/${subtaskId}`,
                  method: "POST",
                  body: {},
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                }),
              }),

              getFilePreview: builder.query({
                query: ({ taskId, docId }) => ({
                  url: `/task/${taskId}/documents/${docId}/preview`,
                  method: "GET",
                  credentials: "include",
                }),
              }),

              trashSubtask: builder.mutation({
  query: ({ subtaskId }) => ({
    url: `/task/trash-subtask/${subtaskId}`,
    method: "PUT",
    credentials: "include",
  }),
}),


deleteRestoreSubtask: builder.mutation({
  query: ({ taskId, subtaskId, actionType }) => ({
    url: `/task/${taskId}/subtasks/${subtaskId}?actionType=${actionType}`,
    method: "PATCH",
    credentials: "include",
  }),
}),




getReportTasks: builder.query({
  query: ({ startDate, endDate } = {}) => {
    let query = "/task/report";
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    if (params.toString()) query += `?${params.toString()}`;

    return {
      url: query,
      method: "GET",
      credentials: "include",
    };
  },
}),

getTrashedSubtasks: builder.query({
  query: () => `/task/trashed-subtasks`,
}),




    }),
});

export const{useGetDashboardStatsQuery,
    useGetAlltaskQuery,
    useCreateTaskMutation,
    useDuplicateTaskMutation,
    useUpdateTaskMutation,
    useTrashTaskMutation,
    useCreateSubTaskMutation,
    useGetSingleTaskQuery,
    usePostTaskActivityMutation,
    useDeleteRestoreTaskMutation,
    useUpdateSubTaskMutation,
    useDeleteSubTaskMutation,
    useUploadTaskDocumentsMutation,
    useDeleteTaskDocumentMutation,
    useAutoAssignUsersToHighPrioritySubtasksMutation,
    useAssignMissingUsersToHighPrioritySubtasksMutation,
    useGetFilePreviewQuery,
    useTrashSubtaskMutation,
    useGetReportTasksQuery, 
    useLazyGetReportTasksQuery,
    useGetTrashedSubtasksQuery,
    useDeleteRestoreSubtaskMutation
}=taskApiSlice