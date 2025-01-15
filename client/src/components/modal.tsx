import { FormEvent, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

interface ModalProps {
  setSelectedImg:  React.Dispatch<React.SetStateAction<string | null>>
}

const Modal: React.FC<ModalProps> = ({
  setSelectedImg
}) => {

  const { removeProfile, isUpdatingProfile } = useAuthStore()
  const modalRef = useRef<HTMLDialogElement>(null)

  const handleImageRemove = async(e: FormEvent<HTMLElement>) => {
    e.preventDefault()
    await removeProfile()
    setSelectedImg(null)
    if (modalRef.current) {
      modalRef.current.close();
    }
  }

  return ( 
    <dialog id="my_modal_3" className="modal" ref={modalRef}>
      <div className="modal-box">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 className="font-bold text-lg">Are you sure you want to remove your profile?</h3>
        <p className="py-4">This action cannot be undone.</p>
        <form method="dialog" className="flex w-full gap-1 justify-end">
          <button 
            className="btn btn-sm btn-error disabled:btn-disabled" 
            disabled={isUpdatingProfile}>No</button>
          <button 
            disabled={isUpdatingProfile}  
            type="submit" 
            className="btn btn-sm btn-primary disabled:btn-disabled" 
            onClick={handleImageRemove}>
            Yes
          </button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
   );
}
 
export default Modal;