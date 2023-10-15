import { memo, useState, useEffect, useRef } from 'react';

interface DynamicClipProps {
    clipPathId: string;
    animation: boolean;
    numRects: number;
    incrementProportion?: number;
    animationDuration?: number;
}

const isOdd = (num: number) => num % 2 !== 0;

function DynamicClip({
    numRects,
    incrementProportion = 0.1,
    animationDuration = 300,
    clipPathId,
    animation,
}: DynamicClipProps) { // To get the animation to work, make sure clippath: url(#clipPathID) is set in desired element's css
    if (incrementProportion < 0 || incrementProportion > 1) {
        throw new Error("incrementProportion must be between 0 and 1.");
    }
    
    const rectHeight = 1 / numRects;
    const intervalDuration = animationDuration / (1 / incrementProportion);

    const [clipPathValues, setClipPathValues] = useState(
        Array.from({ length: numRects }, (_, index) => ({
            width: isOdd(index) ? 1 : 0, // Note that "odd" here is based on the zero-index array, so in the html this would actually apply to "even" elements
            x: isOdd(index) ? 1 : 0,
            y: index * rectHeight,
        }))
    );

    const [showClip, setShowClip] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        setShowClip(true)

        intervalRef.current = setInterval(() => {
            setClipPathValues((prevValues) =>
                prevValues.map((value, index) => {
                    if (animation) { // Increment width and decrement x while staying within bounds
                        const newWidth = Math.min(value.width + incrementProportion, 1);
                        const newX = Math.max(value.x - incrementProportion, 0);
                        return {
                            width: !isOdd(index) ? newWidth : value.width,
                            x: isOdd(index) ? newX : value.x,
                            y: value.y,
                        };
                    } 
                    else { // (reverse animation) Decrement width and increment x while staying within bounds
                        const newWidth = Math.max(value.width - incrementProportion, 0);
                        const newX = Math.min(value.x + incrementProportion, 1);
                        return {
                            width: !isOdd(index) ? newWidth : value.width,
                            x: isOdd(index) ? newX : value.x,
                            y: value.y,
                        };
                    }
                })
            );
        }, intervalDuration);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [animation]);

    useEffect(() => {
        if ((animation && clipPathValues[0].width >= 1) || (!animation && clipPathValues[0].x >= 1)) {
            setShowClip(false);
            clearInterval(intervalRef.current);
        }
    }, [clipPathValues]);

    return (
        showClip && // Hide after animation is over due to it causing parts of components to randomly dissappear for some reason if not hidden afterwards
            <svg width="0" height="0" style={{position: "absolute", zIndex: 9999}}>
                <defs>
                <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                    {clipPathValues.map((value, index) => (
                        <rect
                            key={index}
                            x={value.x.toFixed(3)}
                            y={value.y.toFixed(5)}
                            width={value.width.toFixed(3)}
                            height={rectHeight.toFixed(5)}
                        />
                    ))}
                </clipPath>
                </defs>
            </svg>
    );
}

export default memo(DynamicClip);