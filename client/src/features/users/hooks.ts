import { useQuery } from "@tanstack/react-query"
import { usersAPI } from "./api"
import { useEffect } from "react"
import toast from "react-hot-toast"
import { useUserStore } from "../../store/useUserStore"

export const useGetUsersQuery = () => {
  const { data, error, isLoading, isSuccess, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersAPI.getUsers()
      return response
    },
    refetchOnWindowFocus: false,
    staleTime: 300000
  })


  if (error && isError) {
    const apiError = error
    toast.error(apiError.message);
  }

  useEffect(() => {
    if (isSuccess && data) {
      const { usersWithLastMessage } = data;
      useUserStore.setState(() => ({
        users: usersWithLastMessage
      }))
    }
  },[data, isSuccess])

  return { data, error, isLoading, isError, isSuccess }

}