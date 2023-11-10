import { memo, useState, useEffect } from 'react'
import "./SortingToolbar.scss"
import useDelayedExit from '../../../hooks/useDelayedExit'
import { useFileContext } from '../../../contexts/FileContext'
import DynamicClip from '../../DynamicClip'
import { BsChevronDown } from 'react-icons/bs'

function SortingToolbar() {
    const { selectedItems } = useFileContext()
    const [showToolbar, setShowToolbar] = useState(false)
    useEffect(() => {
        setShowToolbar(selectedItems.length < 1);
    }, [selectedItems]);

    const { isVisible: isToolbarVisible } = useDelayedExit({
        shouldRender: showToolbar
    })

    return (
        isToolbarVisible &&
            <div className="SortingToolbar">
                <div className="main-sort-cont">
                    <button className='recents-sort-btn'>
                        Recents
                        <DynamicClip clipPathId="recentsSortClip" animation={showToolbar} numRects={4}/>
                    </button>
                    <button className='starred-sort-btn'>
                        Starred
                        <DynamicClip clipPathId="starredSortClip" animation={showToolbar} numRects={4}/>
                    </button>
                </div>
                <div className="secondary-sort-cont">
                    <button className='type-sort-btn'>
                        Type
                        <BsChevronDown className='chevron'/>
                        <DynamicClip clipPathId="typeSortClip" animation={showToolbar} numRects={4}/>
                    </button>
                    <button className='people-sort-btn'>
                        People
                        <BsChevronDown className='chevron'/>
                        <DynamicClip clipPathId="peopleSortClip" animation={showToolbar} numRects={4}/>
                    </button>
                </div>
            </div>
    )
}

export default memo(SortingToolbar)