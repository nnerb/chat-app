import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useMessageStore } from "../../../store/useMessageStore";
import { MessageDataProps } from "../../../types";
import { useParams } from "react-router-dom";

const MessageInput = () => {
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, text, setText, isMessagesLoading  } = useMessageStore()
  const { conversationId } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        conversationId: conversationId
      } as MessageDataProps);

      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      // Reset height to calculate the correct scroll height
      textareaRef.current.style.height = "auto";
      // Set height to scroll height but cap at maximum (e.g., 120px)
      const maxHeight = 120; // Adjust this value as needed
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      
      // Show scrollbar ONLY when content exceeds max height
      textareaRef.current.style.overflowY = 
        textareaRef.current.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const form = e.currentTarget.form;
    if (form) form.requestSubmit();
  }
};

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={typeof imagePreview === "string" ? imagePreview : undefined}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              disabled={isMessagesLoading}
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center disabled:btn-disabled"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
        <textarea
          ref={textareaRef}
          className="
            w-full textarea textarea-bordered rounded-lg textarea-sm sm:textarea-md disabled:textarea-disabled
            resize-none min-h-[40px] max-h-32 overflow-y-auto
          "
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}  // <-- Add this
          disabled={isMessagesLoading}
          rows={1}
        />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isMessagesLoading}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle disabled:btn-disabled
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
            disabled={isMessagesLoading}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle disabled:btn-disabled"
          disabled={!text.trim() && !imagePreview || isMessagesLoading}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;