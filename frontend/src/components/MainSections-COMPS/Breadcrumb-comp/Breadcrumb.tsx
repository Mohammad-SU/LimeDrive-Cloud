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
    const [refresh, setRefresh] = useState(false);

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
                - 20
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
    }, [path, btnSegmentRef, refresh]);

    useEffect(() => { // For some reason need to force the other useeffect to run again after initial page load otherwise breadcrumb doesnt look correct 
        const refreshTimeout = setTimeout(() => {
            setRefresh(true);
        }, 1);
        return () => clearTimeout(refreshTimeout);
    }, []);

    return (
        <nav className={`Breadcrumb ${isOverflowControlReady ? '' : 'transparent'}`} ref={breadcrumbRef}>
            {hiddenSegments.length > 0 && 
                <>
                    <div className='btn-segment' ref={btnSegmentRef}>
                        <button 
                            className="icon-btn-wrapper" 
                            onMouseDown={() => setShowDropdown(current => !current)}
                        >
                            <BsThreeDots className="dots-icon icon-btn"/>
                        </button>
                        <span className="divider">/</span>
                    </div>
                    {isDropdownVisible &&
                        <nav className="dropdown" ref={dropdownRef}>
                            {hiddenSegments.map((segment, index) => {
                                const linkToPath = `/${pathSegments.slice(0, index + 1).join('/')}`;
                                const commonAttributes = {
                                    onClick: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
                                        const isAnchor = (event.target as HTMLElement).tagName === 'A';
                                        if (path !== linkToPath && (!isAnchor || (!event.shiftKey && !event.ctrlKey))) { // Ignore key press conditions if not anchor type
                                            setPath(linkToPath.substring(1) + "/");
                                        }
                                    },
                                    tabIndex: 0
                                };
                                
                                if (btnType) {
                                    return (
                                        <button className="item" key={index} {...commonAttributes}>
                                            {decodeURIComponent(segment)}
                                        </button>
                                    );
                                } else {
                                    return (
                                        <Link className="dropdown-btn-link" to={(linkToPath).replace(/[^\/]+/g, (match) => encodeURIComponent(match))} key={index} tabIndex={0}>
                                            <button className="item" {...commonAttributes} tabIndex={-1}>
                                                    {decodeURIComponent(segment)}
                                            </button>
                                        </Link>
                                    );
                                }
                            })}
                            <DynamicClip
                                clipPathId={"breadcrumbDropdownClip"}
                                animation={showDropdown}
                                numRects={Math.min(hiddenSegments.length + 1, 7)}
                            />
                        </nav>
                    }
                </>
            }

            {visibleSegments.map((segment, index) => {
                const isLastCustomSegment = index === pathSegments.length - 1 && pathSegments.length > 1;
                const linkToPath = `/${pathSegments.slice(0, hiddenSegments.length + index + 1).join('/')}`;
                const commonAttributes = {
                    onClick: (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
                        const isAnchor = (event.target as HTMLElement).tagName === 'A';
                        if (path !== linkToPath && (!isAnchor || (!event.shiftKey && !event.ctrlKey))) { // Ignore key press conditions if not anchor type
                            setPath(linkToPath.substring(1) + "/");
                        }
                    },
                    tabIndex: isLastCustomSegment || visibleSegments.length == 1 ? -1 : 0
                };

                return (
                    <div 
                        className="item" 
                        key={index} 
                        ref={isLastCustomSegment ? null : el => segmentRefs.current[index] = el}
                    >
                        {index === 0 ? null : <span className="divider" ref={isLastCustomSegment ? lastDividerRef : null}>/</span>}

                        {btnType ?
                            <button className="text-btn" {...commonAttributes} ref={isLastCustomSegment ? (lastSegmentMainRef as React.RefObject<HTMLButtonElement>) : null}>
                                {decodeURIComponent(segment)}
                            </button>
                            :
                            <Link to={(linkToPath).replace(/[^\/]+/g, (match) => encodeURIComponent(match))} {...commonAttributes} ref={isLastCustomSegment ? (lastSegmentMainRef as React.RefObject<HTMLAnchorElement>) : null}>
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