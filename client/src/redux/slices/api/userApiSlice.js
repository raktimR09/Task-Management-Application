import { apiSlice } from "../apiSlice"

export const userApiSlice=apiSlice.injectEndpoints({
    endpoints:(builder)=>({
        updateUser: builder.mutation({
            query:(data)=>({
                url:"/user/profile",
                method:"PUT",
                body:JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        getTeamList: builder.query ({
            query:()=>({
                url:"/user/get-team",
                method:"GET",
                credentials:"include",
            }),
        }),

        deleteUser: builder.mutation ({
            query:(id)=>({
                url:`/user/${id}`,
                method:"DELETE",
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),

        userAction: builder.mutation ({
            query:(data)=>({
                url:`/user/${data.id}`,
                method:"PUT",
                body:JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
                credentials:"include",
            }),
        }),
    }),
});

export const{useUpdateUserMutation, useGetTeamListQuery,useDeleteUserMutation,useUserActionMutation}=userApiSlice