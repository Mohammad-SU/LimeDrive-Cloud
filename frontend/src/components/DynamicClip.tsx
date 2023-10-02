import { memo, useState, useEffect } from 'react';

interface DynamicClipProps {
    clipPathId: string;
    animation: boolean;
    numRects: number;
    incrementProportion: number;
    animationDuration?: number;
}

const isOdd = (num: number) => num % 2 !== 0;

function DynamicClip({
    numRects,
    incrementProportion,
    animationDuration = 300,
    clipPathId,
    animation,
}: DynamicClipProps) { // To get this animation to work, make sure clippath: url(#clipPathID) is set in desired element's css
    if (incrementProportion < 0 || incrementProportion > 1) {
        throw new Error("incrementProportion must be between 0 and 1.");
    }
    
    const rectHeight = 1 / numRects;
    const intervalDuration = animationDuration / (1 / incrementProportion);

    const [clipPathValues, setClipPathValues] = useState(
        Array.from({ length: numRects }, (_, index) => ({
            width: isOdd(index) ? 1 : 0,
            x: isOdd(index) ? 1 : 0,
            y: index * rectHeight,
        }))
    );

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        interval = setInterval(() => {
            setClipPathValues((prevValues) =>
                prevValues.map((value, index) => {
                    if (animation) {
                        // Increment width and decrement x while staying within bounds
                        const newWidth = Math.min(value.width + incrementProportion, 1);
                        const newX = Math.max(value.x - incrementProportion, 0);
                        return {
                            width: !isOdd(index) ? newWidth : value.width,
                            x: isOdd(index) ? newX : value.x,
                            y: value.y,
                        };
                    } 
                    else {
                        // Decrement width and increment x while staying within bounds
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

        const shouldClearInterval = clipPathValues.some(value => {
            return value.width < 0 || value.width > 1 || value.x < 0 || value.x > 1;
        });

        if (shouldClearInterval) {
            clearInterval(interval);
        }

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };

    }, [animation]);

    return (
        <svg width="0" height="0">
            <defs>
                <clipPath id={clipPathId} clipPathUnits="objectBoundingBox">
                    {clipPathValues.map((value, index) => (
                        <rect
                            key={index}
                            x={value.x}
                            y={value.y}
                            width={value.width}
                            height={rectHeight}
                        />
                    ))}
                </clipPath>
            </defs>
        </svg>
    );
}

export default memo(DynamicClip);