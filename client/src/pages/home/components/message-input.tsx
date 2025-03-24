import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useMessageStore } from "../../../store/useMessageStore";
import FormInput from "./form-input";

const MessageInput = () => {
  const [imagePreview, setImagePreview] = useState<string | ArrayBuffer | null>(null);
  const { text, isMessagesLoading } = useMessageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxHeight = 120;
  
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
 
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
      textareaRef.current.style.overflowY =
        textareaRef.current.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [text]);

  return (
    <div className="p-4 w-full relative">
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
      <FormInput 
        setImagePreview={setImagePreview} 
        imagePreview={imagePreview}
        fileInputRef={fileInputRef}
        textareaRef={textareaRef}
        maxHeight={maxHeight}
      />
    </div>
  );
};
export default MessageInput;
