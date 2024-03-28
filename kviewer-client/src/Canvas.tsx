import React, { useRef, useState, useEffect, useCallback } from 'react';
import {ApiResponse} from './services/ApiHandler';
import ApiHandler from './services/ApiHandler';

interface CanvasProps {
    markerSize: number;
    ascend: boolean;
}
const apiHandler = new ApiHandler();

const Canvas = ({ markerSize, ascend }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pods, setPods] = useState<any>([]);
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

    // This is the actual function that will be called to refresh the content via server
    const refreshContent = useCallback(async () => {
        const response = apiHandler.listPods();
        // Resolve the promise and handle any errors
        response
            .then((resp: ApiResponse) => {
                setPods(resp.data);
                // console.log(resp.data)
            })
            .catch((error) => console.log(error));
    }, [setPods]);

    // This useEffect is for the refresh of content
    useEffect(() => {
        const interval = setInterval(() => {
            refreshContent();
        }, 5000);
 
        // Important to clear the interval
        return () => clearInterval(interval);
    }, [refreshContent]);

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

    const getEarliestAndLatestPods = useCallback(() => {
        if(pods && pods.length > 0){    
            let earliestPod = pods[0];
            let earliestTime = new Date(earliestPod.startTime);
            let latestPod = pods[0];
            let latestTime = new Date(latestPod.startTime);
            pods.forEach((pod: any) => {
                let podTime = new Date(pod.startTime);
                if (podTime < earliestTime){
                    earliestTime = podTime;
                    earliestPod = pod;
                }
                if (podTime > latestTime){
                    latestTime = podTime;
                    latestPod = pod;
                }
            });
            return [earliestPod, latestPod];
        }
        return [];        
    },[pods]);

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
        const timePods = getEarliestAndLatestPods();

        if(timePods.length > 0){
            resetTooltipRegions();

            const durationMinutes = dateDiff(new Date(timePods[0].startTime), new Date(timePods[1].startTime));
            // console.log("Duration is " + durationMinutes + " minutes");

            const gradiants = getGradiants(durationMinutes)
            // console.log(`Each pixel is ${gradiants} many minutes`);


            // timeOfDeltaPod is the time of the latest pod or earliest pod depending on the ascend flag
            let timeOfDeltaPod = 0;
            if (ascend){
                timeOfDeltaPod = new Date(timePods[0].startTime).getTime()/1000;
            }
            else {
                timeOfDeltaPod = new Date(timePods[1].startTime).getTime()/1000;
            }

            timeOfDeltaPod /= 60;
            timeOfDeltaPod = Math.abs(Math.round(timeOfDeltaPod));

            let textY = 100;
            pods.forEach((pod: any) => {
                ctx.beginPath();

                // Convert pod start time to number of minutes
                let timeOfPod = new Date(pod.startTime).getTime() / 1000;
                timeOfPod /= 60;
                timeOfPod = Math.abs(Math.round(timeOfPod));
                // console.log(`Time of pod is ${timeOfPod} minutes`);
                // console.log(`Pod is this many minutes - latest ${Math.round(timeOfLatestPod - timeOfPod)} minutes`);

                let x = 0;
                if (ascend){
                    x = Math.round((timeOfPod - timeOfDeltaPod) / gradiants) + xOffset;
                } else {
                    x = Math.round((timeOfDeltaPod - timeOfPod) / gradiants) + xOffset;
                }
                console.log(`Pod is ${x} on axis`);

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
                let markerText = pod.name;
                let metrics = ctx.measureText(markerText);
                let markerTextWidth = metrics.width;
                let markerTextHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;

                // If the text will go off the canvas, move it to the left of the marker
                if (textX + markerTextWidth > canvasSize.width){
                    textX = x - markerTextWidth - markerSize;
                }
                ctx.fillText(pod.name, textX, textY);

                updateTooltipRegions({x: textX, y: textY, width: markerTextWidth, height: markerTextHeight, contentRef: pod});

                textY+=yOffset;
            })

            // Put time markers on the timeline
            let timeMarkerDate = new Date(timeOfDeltaPod*60*1000);
            let timeMarkerX = xOffset;
            let altYPos = false;
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

                // Increment the timeMarker by the gradiants
                // timeMarker is the x-axis time marker so we subtract the offset. Then for each pixel
                // multiply the gradiants to get the time in minutes. Then into milliseconds.
                if(!ascend){
                    timeMarkerDate = new Date(timeMarkerDate.getTime() + ((timeMarkerX-xOffset *gradiants)*60*1000));
                }
                else {
                    timeMarkerDate = new Date(timeMarkerDate.getTime() - ((timeMarkerX-xOffset *gradiants)*60*1000));
                }
                altYPos = !altYPos;
                timeMarkerX += gradiants;
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
    },[ascend, markerSize, canvasSize.width, pods, getEarliestAndLatestPods, dateDiff, getGradiants, updateTooltipRegions, resetTooltipRegions]);


    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx == null) {
                throw new Error('Could not get context');
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            drawGrid(ctx)
            drawContent(ctx)
        }       
    },[markerSize, canvasSize.width, drawContent, drawGrid]);

    // This useEffect is for the mouse move event to create a tooltip
    // TODO currently the tooltip will be removed by the re-render after each poll interval
    // so once that is fixed, the tooltip will need to be removed by a timeout and figure out
    // how to delete it when the mouse moves off the area - maybe a full redraw?
    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx == null) {
                throw new Error('Could not get context');
            }
            // function clear() { // Clears screen to prevent smearing
            //     ctx.fillStyle = "white";
            //     ctx.fillRect(0, 0, 500, 250);
            // }

            // function drawrect() { // Draws rectangle
            //     ctx.fillStyle = "gray";
            //     ctx.fillRect(50, 50, 200, 100);
            // }

            // clear();
            // drawrect();

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

                if (foundRegion) { // If mouse x and y are inside rectangle          
                    setTooltipDisplayed(true);

                    ctx.beginPath();
                    ctx.font = "20px georgia";
                    //TODO make this multi-line
                    // const txt = `${foundRegion.contentRef.name}`;
                    const txt = `${foundRegion.contentRef.name}${foundRegion.contentRef.startTime}`;
                    ctx.fillStyle = "white";
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = "black";

                    // Adjust the tooltip if it goes off the canvas
                    const tooltipWidth = ctx.measureText(txt).width;
                    let tooltipX = foundRegion.x;
                    if (tooltipX + tooltipWidth > canvasSize.width){
                        const adjust = tooltipX + tooltipWidth - canvasSize.width;
                        tooltipX -= adjust + gridSpacing;
                    }

                    ctx.rect(tooltipX, foundRegion.y -20, tooltipWidth, 24);
                    ctx.fill();
                    ctx.stroke();
                    ctx.closePath();

                    ctx.beginPath();    
                    ctx.fillStyle = "blue";
                    ctx.fillText(txt, tooltipX, foundRegion.y); // Draw text
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
        
    },[toolTipDisplayed, setRequireRedraw, canvasSize.width, setTooltipDisplayed, markerSize]);

    useEffect(() => {
        if(requireRedraw){
            console.log("Invalidate rect");
            // Clear the canvas and redraw
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
        }
        setRequireRedraw(false);
    }, [requireRedraw, setRequireRedraw, drawGrid, drawContent]);

    return <>
        <canvas ref={canvasRef} height={canvasSize.height} width={canvasSize.width} />
    </>;
};

Canvas.defaultProps = {
    markerSize: 0,
    ascend: true,
};

export default Canvas;
export type { CanvasProps };