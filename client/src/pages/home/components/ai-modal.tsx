import { Loader, MessageSquare, RefreshCcw } from "lucide-react";
import { useMessageStore } from "../../../store/useMessageStore";
import { useParams } from "react-router-dom";

const MAX_REGENERATIONS = 3;

const AIModal = () => {

  const { 
    aiGeneratedResponse, 
    generateAIResponse, 
    isGeneratingAIResponse, 
    selectedMessageId, 
    setText,
    aiGeneratedRepliesCount,
  } = useMessageStore()

  const { conversationId } = useParams(); 
  const remaining = Math.max(0, MAX_REGENERATIONS - aiGeneratedRepliesCount);
  return ( 
    <dialog id="my_modal_2" className="modal">
      <div className="modal-box max-w-md mx-auto">
        {/* Header/Label */}
        <h3 className="text-lg font-bold text-center mb-4">AI Reply Suggestions</h3>
        {isGeneratingAIResponse ? (
        // Loading State
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <span className="text-lg font-medium text-base-content">Generating suggestions...</span>
            <Loader className="animate-spin w-8 h-8 text-primary" />
          </div>
        ) : (
          // AI Generated Responses
          <div className="space-y-3">
            {aiGeneratedResponse?.map((res, index) => (
              <div
                key={index}
                className="
                  p-4 bg-base-200 rounded-lg cursor-pointer hover:bg-base-300 
                  transition-colors duration-200 flex items-start space-x-3
                "
                onClick={() => {
                  const modal = document.getElementById("my_modal_2");
                  if (modal) (modal as HTMLDialogElement).close(); 
                  setText(res)
                }}
              >
                {/* Icon */}
                <MessageSquare className="text-primary"/>
                {/* Response Text */}
                <p className="text-base-content flex-1">{res}</p>
              </div>
            ))}
          </div>
        )}
          <button
            className="btn btn-outline btn-primary w-full mt-4 disabled:btn-disabled"
            disabled={isGeneratingAIResponse || remaining === 0}
            onClick={async() => {
              const regenerate = true
              if (conversationId) {
                const data = {
                  conversationId,
                  selectedMessageId: selectedMessageId
                }
                await generateAIResponse(data, regenerate)
              }
            }}
          >
          <RefreshCcw size={14}/>
            Regenerate {((!isGeneratingAIResponse && aiGeneratedResponse) && 
          `(${remaining} regeneration${remaining <= 1 ? "" : "s"} left)`) || ""}
          </button>
        </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
   );
}
 
export default AIModal;