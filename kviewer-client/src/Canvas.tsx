import React, { useRef, useState, useEffect, useCallback } from 'react';

interface CanvasProps {
    markerSize: number;
    ascend: boolean;
    contentArray?: any[],
    getEarliestAndLatestContent: () => any[],
    timePropName: string;
}

const Canvas = ({ markerSize, ascend, contentArray, getEarliestAndLatestContent, timePropName }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [toolTipDisplayed, setTooltipDisplayed] = useState<boolean>(false);
    const [requireRedraw, setRequireRedraw] = useState<boolean>(false);
    const [canvasSize, setCanvasSize] = useState({width: window.innerWidth, height: window.innerHeight})

    interface TooltipRegion {
        x: number;
        y: number;
        width: number;
        height: number;
        contentRef: any;
    }
    const tooltipRegions = useRef<TooltipRegion[]>([]);

    const gridSpacing = 50;

    const resetTooltipRegions = useCallback(() => {
        tooltipRegions.current = [];
    },[]);

    const updateTooltipRegions = useCallback((newRegion: TooltipRegion) => {
        tooltipRegions.current.push(newRegion);
    },[]);

    // This useEffect is for the window resize event
    useEffect(() => {
        const handleResize = () => setCanvasSize({
            width: window.innerWidth,
            height: window.innerHeight
        })
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
      }, [])

    const drawGrid = useCallback((ctx: any) => {
        for (let i = 0; i < canvasSize.width; i+=gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvasSize.height);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0,125,0,0.35)';
            ctx.stroke();
            ctx.closePath();
        }
        for (let i = 0; i < canvasSize.height; i+=gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvasSize.width, i);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0,125,0,0.3)';
            ctx.stroke();
            ctx.closePath();
        }
    },[canvasSize.height, canvasSize.width]);

    const dateDiff = useCallback((earliest: Date, latest: Date) => {
        // Calculate the difference in milliseconds between the two provided dates and convert it to seconds
        let diff =(latest.getTime() - earliest.getTime()) / 1000;
        // Convert the difference from seconds to minutes
        diff /= 60;

        // Return the absolute value of the rounded difference in minutes
        const durationMinutes = Math.abs(Math.round(diff)); 

        // Useful debug
        // Store the input number of minutes in a variable num
        // let num = durationMinutes;
        // // Calculate the total hours by dividing the number of minutes by 60
        // let hours = (num / 60);
        // // Round down the total hours to get the number of full hours
        // let rhours = Math.floor(hours);
        // // Calculate the remaining minutes after subtracting the full hours from the total hours
        // let minutes = (hours - rhours) * 60;
        // // Round the remaining minutes to the nearest whole number
        // let rminutes = Math.round(minutes);
        // // Construct and return a string representing the conversion result
        // console.log("Duration " + num + " minutes = " + rhours + " hour(s) and " + rminutes + " minute(s).");

        return durationMinutes;    
    },[]);

    const xOffset = 50, yOffset = 50;

    const getGradiants = useCallback((durationMinutes: number) => {
        // Divide duration minutes by width
        return Math.round(durationMinutes/ (canvasSize.width-(xOffset*2)));
    }, [canvasSize.width]);

    const drawContent = useCallback((ctx: any) => {
        const earlyAndLatest = getEarliestAndLatestContent();

        if(contentArray && earlyAndLatest.length > 0){
            // console.log("Time deltas are " + earlyAndLatest[0][timePropName] + " and " + earlyAndLatest[1][timePropName]);
            console.log("Drawing content");

            resetTooltipRegions();

            const durationMinutes = dateDiff(new Date(earlyAndLatest[0][timePropName]), new Date(earlyAndLatest[1][timePropName]));
            // console.log("Duration is " + durationMinutes + " minutes");

            const gradiants = getGradiants(durationMinutes)
            // console.log(`Each gradiant is ${gradiants} many pixels`);

            // timeOfDeltaItem is the time of the latest item or earliest item depending on the ascend flag
            let timeOfDeltaItem = 0;
            if (ascend){
                timeOfDeltaItem = new Date(earlyAndLatest[0][timePropName]).getTime()/1000;
            }
            else {
                timeOfDeltaItem = new Date(earlyAndLatest[1][timePropName]).getTime()/1000;
            }

            timeOfDeltaItem /= 60;
            timeOfDeltaItem = Math.abs(Math.round(timeOfDeltaItem));

            let textY = 100;
            contentArray.forEach((item: any) => {
                ctx.beginPath();

                // Convert item start time to number of minutes
                let timeOfItem = new Date(item[timePropName]).getTime() / 1000;
                timeOfItem /= 60;
                timeOfItem = Math.abs(Math.round(timeOfItem));
                // console.log(`Time of item is ${timeOfItem} minutes`);
                // console.log(`Item is this many minutes - latest ${Math.round(timeOfDeltaItem - timeOfItem)} minutes`);

                let x = 0;
                if (ascend){
                    x = Math.round((timeOfItem - timeOfDeltaItem) / gradiants) + xOffset;
                } else {
                    x = Math.round((timeOfDeltaItem - timeOfItem) / gradiants) + xOffset;
                }
                // console.log(`Item is ${x} on axis`);

                ctx.arc(x, yOffset, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
                ctx.fill();
                ctx.closePath();

                // By not beginning a new path, a happy little accident means we have a pointer line to the text
                // ctx.beginPath();
                ctx.arc(x, textY, markerSize, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
                ctx.fill();
                ctx.closePath();

                ctx.font = "12px Arial";
                let textX = x +10;
                let markerText = item.name;
                let metrics = ctx.measureText(markerText);
                let markerTextWidth = metrics.width;
                let markerTextHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

                // If the text will go off the canvas or the offset, move it to the left of the marker
                if (textX + markerTextWidth > canvasSize.width - xOffset){
                    textX = x - markerTextWidth - markerSize;
                }
                ctx.fillText(item.name, textX, textY);

                updateTooltipRegions({x: textX, y: textY, width: markerTextWidth, height: markerTextHeight, contentRef: item});

                textY+=yOffset;
            })

            // Put time markers on the timeline
            let timeMarkerDate = new Date(timeOfDeltaItem*60*1000);
            let timeMarkerX = xOffset;
            let altYPos = false;

            const numberOfMarkers = Math.floor((canvasSize.width-(xOffset*2))/gridSpacing);
            let step=0
            const timeIncrInMinutes = (durationMinutes/numberOfMarkers);
            // console.log(`Time to last delta is ${timeIncrInMinutes * numberOfMarkers} minutes`);
            // console.log(`Time to last delta is ${timeIncrInMinutes * numberOfMarkers *60*1000} ms`);
            // console.log(`Date to last delta is approx ${new Date(timeMarkerDate.getTime() + (timeIncrInMinutes * numberOfMarkers *60*1000))}`);

            while (timeMarkerX < canvasSize.width - xOffset){
                ctx.beginPath();
                ctx.moveTo(timeMarkerX, yOffset);
                ctx.lineTo(timeMarkerX, yOffset-10);
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
                ctx.closePath();

                ctx.font = "9px Arial";
                let yAlt = altYPos ? 20 : 0;
                ctx.fillText(timeMarkerDate.toLocaleDateString(), timeMarkerX-10, yOffset-15-yAlt);

                // Increment the timeMarker by minutes of each step and recalc to ms

                const minuteDeleta = timeIncrInMinutes * step;

                if(ascend){
                    timeMarkerDate = new Date(timeOfDeltaItem*60*1000 + (minuteDeleta*60*1000));
                }
                else {
                    timeMarkerDate = new Date(timeOfDeltaItem*60*1000 - (minuteDeleta*60*1000));
                }
                altYPos = !altYPos;
                timeMarkerX += gradiants;
                step++;
            }
        }

        // Timeline
        ctx.beginPath();
        ctx.moveTo(xOffset, yOffset);
        ctx.lineTo(canvasSize.width - xOffset, yOffset);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.closePath();
    },[ascend, markerSize, canvasSize.width, contentArray, getEarliestAndLatestContent, dateDiff, getGradiants, updateTooltipRegions, resetTooltipRegions, timePropName]);

    // Main top level redraw to the canvas
    const redraw = useCallback(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx == null) {
                throw new Error('Could not get context');
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            drawGrid(ctx);
            drawContent(ctx);
        }
    },[drawGrid, drawContent]);

    // useEffect canvas size and marksize changes
    useEffect(() => {
        redraw();
    },[markerSize, canvasSize.width, redraw]);

    // This useEffect is for the mouse move event to create a tooltip
    // The tooltip will be displayed if the registered regions of text are hovered over
    // and when existing, the tooltip will be removed by a full redraw request
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx == null) {
                throw new Error('Could not get context');
            }

            // Register the regions of text that will have tooltips
            const mouseInTooltipRegions = (x: number, y: number) => {
                return tooltipRegions.current.find((region: TooltipRegion) => {
                    return x > region.x && x < region.x + region.width &&
                       y > (region.y - region.height) && y < region.y;
                }
            )};

            const mouseMove = (event: any) => {
                const x = event.offsetX;
                const y = event.offsetY;
                const foundRegion = mouseInTooltipRegions(x,y);

                const alreadyShowingToolip = toolTipDisplayed;

                if (foundRegion) {
                    // If mouse x and y are inside rectangle          
                    setTooltipDisplayed(true);

                    ctx.beginPath();
                    ctx.font = "20px georgia";
                    
                    // Multi-line tooltips are split by newline
                    const txt = `${foundRegion.contentRef.name}\n${foundRegion.contentRef[timePropName]}`;

                    const txtLines = txt.split('\n');
                    let maxTxtWidth = 0;
                    txtLines.forEach((line) => {
                        const lineWidth = ctx.measureText(line).width;
                        if (lineWidth > maxTxtWidth){
                            maxTxtWidth = lineWidth;
                        }
                    });

                    ctx.fillStyle = "white";
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "black";

                    // Adjust the tooltip if it goes off the canvas
                    let tooltipX = foundRegion.x;
                    if (tooltipX + maxTxtWidth > canvasSize.width){
                        const adjust = tooltipX + maxTxtWidth - canvasSize.width;
                        tooltipX -= adjust + xOffset;
                    }

                    ctx.rect(tooltipX, foundRegion.y -20, maxTxtWidth, 24 * txtLines.length);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();    
                    ctx.fillStyle = "blue";
                    for (let i = 0; i < txtLines.length; i++){
                        ctx.fillText(txtLines[i], tooltipX, foundRegion.y + (i*24)); // Draw text
                    }
                    ctx.closePath();
                }
                else {
                    setTooltipDisplayed(false);
                    if (alreadyShowingToolip){
                        setRequireRedraw(true);
                    }
                }
            };

            canvasRef.current && canvasRef.current.addEventListener("mousemove", mouseMove);

            // The clean up ref needs to be assigned to a variable to be used in the return function
            // which is a clean up function the useEffect hook will call when the component is unmounted
            const cleanUp = canvasRef.current;
            
            return () => {
                cleanUp && cleanUp.removeEventListener('mousemove', mouseMove);
            };
        }
        
    },[toolTipDisplayed, setRequireRedraw, canvasSize.width, setTooltipDisplayed, markerSize, timePropName]);

     // The main purpose of this useEffect is to redraw the canvas when the tooltip is to be cleared
     // which is a forced redraw after leaving the tooltip region
    useEffect(() => {
        if(requireRedraw){
            console.log("Invalidate rect");
            redraw();
        }
        setRequireRedraw(false);
    }, [requireRedraw, setRequireRedraw, redraw]);

    return <>
        <canvas ref={canvasRef} height={canvasSize.height} width={canvasSize.width} />
    </>;
};

Canvas.defaultProps = {
    markerSize: 0,
    ascend: true,
    contentArray: [],
    getEarliestAndLatestContent: () => [],
    timePropName: ""
};

export default Canvas;
export type { CanvasProps };