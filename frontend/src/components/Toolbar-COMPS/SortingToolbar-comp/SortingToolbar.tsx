import { memo, useState, useEffect } from 'react'
import "./SortingToolbar.scss"
import { useFileContext } from '../../../contexts/FileContext'
import { useToast } from '../../../contexts/ToastContext'
import useDelayedExit from '../../../hooks/useDelayedExit'
import DynamicClip from '../../DynamicClip'
import { BsChevronDown } from 'react-icons/bs'

function SortingToolbar() {
    const { selectedItems } = useFileContext()
    const { showToast } = useToast()
    const [showToolbar, setShowToolbar] = useState(true)
    useEffect(() => {
        setShowToolbar(selectedItems.length < 1);
    }, [selectedItems]);

    const { isVisible: isToolbarVisible } = useDelayedExit({
        shouldRender: showToolbar,
        delayMs: 200,
    })

    return (
        isToolbarVisible &&
            <div className="SortingToolbar">
                <div className="main-sort-cont">
                    <button className='recents-sort-btn' onClick={() => showToast({message: "Sorting by recents not yet featured.", showFailIcon: true})}>
                        Recents
                        <DynamicClip clipPathId="recentsSortClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                    <button className='starred-sort-btn' onClick={() => showToast({message: "Sorting by starred not yet featured.", showFailIcon: true})}>
                        Starred
                        <DynamicClip clipPathId="starredSortClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                </div>
                <div className="secondary-sort-cont">
                    <button className='type-sort-btn' onClick={() => showToast({message: "Sorting by type not yet featured.", showFailIcon: true})}>
                        Type
                        <BsChevronDown className='chevron'/>
                        <DynamicClip clipPathId="typeSortClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                    <button className='people-sort-btn' onClick={() => showToast({message: "Sorting by people not yet featured.", showFailIcon: true})}>
                        People
                        <BsChevronDown className='chevron'/>
                        <DynamicClip clipPathId="peopleSortClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                </div>
            </div>
    )
}

export default memo(SortingToolbar)