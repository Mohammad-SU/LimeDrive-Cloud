import { memo, useState, useEffect, useRef } from 'react';
import "./Breadcrumb.scss"
import useClickOutside from '../../../hooks/useClickOutside';
import useDelayedExit from '../../../hooks/useDelayedExit';
import DynamicClip from '../../DynamicClip';
import { BsThreeDots } from 'react-icons/bs';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
    path: string;
    setPath: React.Dispatch<React.SetStateAction<string>>;
    btnType?: boolean;
}

function Breadcrumb({ path, setPath, btnType }: BreadcrumbProps) {
    const pathSegments = path.split('/').filter(segment => segment.trim() !== '');
    const [showDropdown, setShowDropdown] = useState(false);
    const [visibleSegments, setVisibleSegments] = useState<string[]>([]);
    const [hiddenSegments, setHiddenSegments] = useState<string[]>([]);
    const breadcrumbRef = useRef<HTMLElement | null>(null);
    const dropdownRef = useRef<HTMLButtonElement | null>(null);
    const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const btnSegmentRef = useRef<(HTMLDivElement | null)>(null);
    const lastSegmentMainRef = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
    const lastDividerRef = useRef<HTMLSpanElement | null>(null);
    const [isOverflowControlReady, setIsOverflowControlReady] = useState(false);

    useClickOutside(dropdownRef, () => {
        setShowDropdown(false);
    });
    const { isVisible: isDropdownVisible } = useDelayedExit({
        shouldRender: showDropdown
    })

    const overflowControl = () => {
        setIsOverflowControlReady(false);
        setVisibleSegments(pathSegments)
        setShowDropdown(false)
        setTimeout(() => { // Delayed to make sure segmentWidths are accurately updated
            let totalWidth = 0;
            const maxWidth = breadcrumbRef.current!.getBoundingClientRect().width
                - (btnSegmentRef?.current?.getBoundingClientRect()?.width || 0) 
                - 20;
            const segmentWidths = segmentRefs.current!.map(ref => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        return rect.width;
                    }
                    return 0;
                })
                .filter(width => width !== 0);
            if (lastSegmentMainRef.current && lastDividerRef.current) {
                segmentWidths.push(lastSegmentMainRef.current.getBoundingClientRect().width + lastDividerRef.current.getBoundingClientRect().width);
            }

            for (let i = 0; i < segmentWidths.length; i++) {
                totalWidth += segmentWidths[i];
            }
            if (totalWidth > maxWidth) {
                let sum = 0;
                let visible = [];
                let hidden = [];
                for (let i = segmentWidths.length - 1; i >= 0; i--) {
                    sum += segmentWidths[i];
                    if (sum > maxWidth) {
                        hidden.unshift(pathSegments[i]);
                    } 
                    else {
                        visible.unshift(pathSegments[i]);
                    }
                }
                if (visible.length === 0) {
                    visible.push(hidden.pop() || '');
                }
                setVisibleSegments(visible);
                setHiddenSegments(hidden);
            }
            else {
                setVisibleSegments(pathSegments);
                setHiddenSegments([]);
            }

            setIsOverflowControlReady(true);
        }, 1);
    };

    useEffect(() => {
        overflowControl();
        window.addEventListener("resize", overflowControl);
        return () => {
            window.removeEventListener("resize", overflowControl);
        };
    }, [path, btnSegmentRef]);

    return (
        <nav className={`Breadcrumb ${isOverflowControlReady ? '' : 'transparent'}`} ref={breadcrumbRef}>
            {hiddenSegments.length > 0 && 
                <>
                    <div className='btn-segment' ref={btnSegmentRef}>
                        <button className="icon-btn-wrapper" onMouseDown={() => setShowDropdown(current => !current)}>
                            <BsThreeDots className="dots-icon icon-btn"/>
                        </button>
                        <span className="divider">/</span>
                    </div>
                    {isDropdownVisible &&
                        <nav className="dropdown" ref={dropdownRef}>
                            {hiddenSegments.map((segment, index) => {
                                const linkToPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
                                
                                if (btnType) {
                                    return (
                                        <button className="item" key={index} onClick={() => {
                                            if (path !== linkToPath) {
                                                setPath(linkToPath.substring(1) + "/");
                                            }
                                        }}>
                                            {decodeURIComponent(segment)}
                                        </button>
                                    );
                                } else {
                                    return (
                                        <Link className="dropdown-btn-link" to={linkToPath}>
                                            <button className="item" key={index}>
                                                    {decodeURIComponent(segment)}
                                            </button>
                                        </Link>
                                    );
                                }
                            })}
                            <DynamicClip
                                clipPathId={"breadcrumbDropdownClip"}
                                animation={showDropdown}
                                numRects={6}
                            />
                        </nav>
                    }
                </>
            }

            {visibleSegments.map((segment, index) => {
                const isLastCustomSegment = index === pathSegments.length - 1 && pathSegments.length > 1;
                const linkToPath = `/${pathSegments.slice(0, hiddenSegments.length + index + 1).join('/')}`;
                const commonAttributes = {
                    onClick: () => {
                        if (path !== linkToPath) {
                            setPath(linkToPath.substring(1) + "/");
                        }
                    }
                };

                return (
                    <div 
                        className="item" 
                        key={index} 
                        ref={isLastCustomSegment ? null : el => segmentRefs.current[index] = el}
                    >
                        {index === 0 ? null : <span className="divider" ref={isLastCustomSegment ? lastDividerRef : null}>/</span>}

                        {btnType ?
                            <button 
                            className="text-btn" {...commonAttributes} ref={isLastCustomSegment ? (lastSegmentMainRef as React.RefObject<HTMLButtonElement>) : null}>
                                {decodeURIComponent(segment)}
                            </button>
                            :
                            <Link to={linkToPath} {...commonAttributes} ref={isLastCustomSegment ? (lastSegmentMainRef as React.RefObject<HTMLAnchorElement>) : null}>
                                {decodeURIComponent(segment)}
                            </Link>
                        }
                    </div>
                )
            })}
        </nav>
    );
}

export default memo(Breadcrumb);