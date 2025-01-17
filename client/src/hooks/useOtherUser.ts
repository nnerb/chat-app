interface UseOtherUserProps {
  conversationId: string;
}

const useOtherUser: React.FC<UseOtherUserProps> = ({ conversationId }) => {
  return conversationId
}
 
export default useOtherUser;