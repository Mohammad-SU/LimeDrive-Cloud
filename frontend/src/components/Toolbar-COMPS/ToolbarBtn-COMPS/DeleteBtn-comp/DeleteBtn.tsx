import "./DeleteBtn.scss"
import { memo, useState, useEffect } from 'react'
import { useFileContext } from '../../../../contexts/FileContext'
import Modal from '../../../Modal-comp/Modal'
import { useToast } from "../../../../contexts/ToastContext"
import { SlTrash } from 'react-icons/sl'
import { IoWarningSharp } from "react-icons/io5";
import { useUserContext } from "../../../../contexts/UserContext"

function DeleteBtn({ toolbarRendered }: { toolbarRendered: boolean }) {
    const { selectedItems } = useFileContext()
    const { showToast } = useToast()
    const { apiSecure } = useUserContext()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleModalDeleteClick = async () => {

    }

    return (
        <>
            <button className="DeleteBtn" onClick={() => setShowDeleteModal(true)}>
                <SlTrash className="tool-icon trash-icon"/>
                Delete
            </button>

            <Modal
                className="delete-modal"
                render={showDeleteModal && toolbarRendered}
                clipPathId="deleteModalClip"
                numRects={10}
                onCloseClick={() => setShowDeleteModal(false)}
                // closeBtnTabIndex={loading ? 0 : -1}
            >
                <h1>
                    Delete {
                        selectedItems.length === 1 && typeof selectedItems[0].id === "number" ?
                            "File"
                        : selectedItems.length === 1 && typeof selectedItems[0].id === "string" ?
                            "Folder"
                        : `${selectedItems.length} Items`
                    }?
                </h1>

                <div className="main-content">
                    <IoWarningSharp className="warning-icon"/>
                    <p>
                        Are you sure you want to delete this item <strong>permanently</strong>? 
                        <br />(The recycle bin is not yet featured)
                    </p>
                </div>

                <div className="modal-btn-cont">
                    <button className='modal-cancel-btn' onClick={() => setShowDeleteModal(false)} disabled={false}>
                        Cancel
                    </button>
                    <button 
                        className='modal-primary-btn'
                        onClick={handleModalDeleteClick}
                        disabled={selectedItems.length == 0}
                    >
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default memo(DeleteBtn)