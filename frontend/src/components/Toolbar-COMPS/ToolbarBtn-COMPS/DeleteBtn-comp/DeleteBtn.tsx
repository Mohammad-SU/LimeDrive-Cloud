import "./DeleteBtn.scss"
import { memo, useState, useEffect } from 'react'
import { useFileContext } from '../../../../contexts/FileContext'
import Modal from '../../../Modal-comp/Modal'
import { ItemTypes } from "../../../../types"
import { useToast } from "../../../../contexts/ToastContext"
import { SlTrash } from 'react-icons/sl'
import { IoWarningSharp } from "react-icons/io5";
import { useUserContext } from "../../../../contexts/UserContext"

function DeleteBtn({ toolbarRendered }: { toolbarRendered: boolean }) {
    const { selectedItems, setFolders, setFiles } = useFileContext()
    const { showToast } = useToast()
    const { apiSecure } = useUserContext()
    const [loading, setLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleModalDeleteClick = async () => {
        if (selectedItems.length == 0) return

        try {
            setLoading(true)
            setShowDeleteModal(false);
            const textType = selectedItems.length == 1 ? (selectedItems[0].type == 'folder' ? 'folder' : 'file') : `${selectedItems.length} items`;
            showToast({message: `Deleting ${textType}...`, loading: true});

            const itemsToDeleteData = selectedItems.map(item => {
                const postId = !item.type ? // If folder (id has d_ prefix on the frontend) then filter it for the backend
                    parseInt((item.id as string).substring(2))
                    : item.id

                return {
                    id: postId,
                    type: item.type,
                }
            })
            const response = await apiSecure.post('/deleteItems', {
                items: itemsToDeleteData
            });

            setFolders(existingFolders => {
                return existingFolders.filter(existingFolder => {
                    return !response.data.deletedFolderIds.some((deletedFolderId: number) => "d_" + deletedFolderId === existingFolder.id); // folder IDs have d_ prefix on frontend
                });
            });
            setFiles(existingFiles => {
                return existingFiles.filter(existingFile => {
                    return !response.data.deletedFileIds.some((deletedFileId: number) => deletedFileId === existingFile.id);
                });
            });
            showToast({message: "Item deleted.", showSuccessIcon: true})
        } 
        catch (error) {
            console.error(error);
            showToast({message: "Failed to delete. Please check your connection.", showFailIcon: true})
        }
        finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button 
                className="DeleteBtn" 
                onClick={() => {
                    if (selectedItems.length == 0) return
                    setShowDeleteModal(true)
                }}
            >
                <SlTrash className="tool-icon trash-icon"/>
                Delete
            </button>

            <Modal
                className="delete-modal"
                render={showDeleteModal && toolbarRendered}
                clipPathId="deleteModalClip"
                numRects={10}
                onCloseClick={() => setShowDeleteModal(false)}
                closeBtnTabIndex={loading ? 0 : -1}
            >
                <h1>
                    Delete {
                        selectedItems.length == 1 && typeof selectedItems[0].id === "number" ? "File"
                        : selectedItems.length == 1 && typeof selectedItems[0].id === "string" ? "Folder"
                        : `${selectedItems.length} Items`
                    }?
                </h1>

                <div className="main-content">
                    <IoWarningSharp className="warning-icon"/>
                    <p>
                        Are you sure you want to delete {
                            selectedItems.length == 1 ?
                                <span className="item-name">"{selectedItems[0].name}" </span> // Leave space
                            : `${selectedItems.length} items `
                        }
                        <strong>permanently</strong>? 
                        <br />(Recycle bin not yet featured)
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