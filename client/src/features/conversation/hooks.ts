import { useMutation } from "@tanstack/react-query"
import { conversationAPI } from "./api"
import toast from "react-hot-toast"
import { useMessageStore } from "../../store/useMessageStore"

export const useGetConversationQuery = () => {
  return useMutation({
    mutationFn: conversationAPI.getConversation,
    onSuccess(data, variables) {
      const { conversation } = data 
      const { navigate } = variables;
      useMessageStore.setState(() => ({
        conversation,
        validConversationId: true,
        activeConversationId: conversation._id,
        messages: []
      }))
      navigate(`/messages/${conversation._id}`)
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}