import React, { useRef, useEffect, useCallback } from 'react';

interface CanvasProps {
    width: number;
    height: number;
    markerSize: number;
    pods: any[];
}

const Canvas = ({ width, height, markerSize, pods }: CanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawGrid = useCallback((ctx: any) => {
        for (let i = 0; i < width; i+=50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0,125,0,0.35)';
            ctx.stroke();
            ctx.closePath();
        }
        for (let i = 0; i < height; i+=50) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(0,125,0,0.3)';
            ctx.stroke();
            ctx.closePath();
        }
    },[height, width]);

    const getEarliestAndLatestPods = useCallback(() => {
        if(pods.length > 0){    
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

    const getGradiants = useCallback((durationMinutes: number) => {
        // Divide duration minutes by width
        return Math.round(durationMinutes/width);
    }, [width]);

    const drawCircle = useCallback((ctx: any) => {
        ctx.beginPath();
        ctx.arc(50, 50, 5+markerSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        const timePods = getEarliestAndLatestPods();
        if(timePods.length > 0){
            const durationMinutes = dateDiff(new Date(timePods[0].startTime), new Date(timePods[1].startTime));
            // console.log("Duration is " + durationMinutes + " minutes");

            const gradiants = getGradiants(durationMinutes)
            // console.log(`Each pixel is ${gradiants} many minutes`);


            // let timeOfLatestPod = new Date(timePods[0].startTime).getTime()/1000;
            let timeOfLatestPod = new Date(timePods[1].startTime).getTime()/1000; //THIS IS THE ORIGINAL
            timeOfLatestPod /= 60;
            timeOfLatestPod = Math.abs(Math.round(timeOfLatestPod));

            let offset = 50, y = 50, textY = 100;
            pods.forEach((pod: any) => {
                ctx.beginPath();

                // Convert pod start time to number of minutes
                let timeOfPod = new Date(pod.startTime).getTime() / 1000;
                timeOfPod /= 60;
                timeOfPod = Math.abs(Math.round(timeOfPod));
                // console.log(`Time of pod is ${timeOfPod} minutes`);
                // console.log(`Pod is this many minutes - latest ${Math.round(timeOfLatestPod - timeOfPod)} minutes`);

                // let x = Math.round((timeOfPod - timeOfLatestPod) / gradiants) + offset;
                let x = Math.round((timeOfLatestPod - timeOfPod) / gradiants) + offset; /// THIS IS THE ORIGINAL
                if (x > width){
                    // Rounding may push it over the width
                    x = width - 50;
                }

                // console.log(`Pod is ${x} on axis`);

                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
                ctx.fill();
                ctx.closePath();

                // By not beginning a new path, a happy little accident means we have a pointer line to the text
                // ctx.beginPath();
                ctx.arc(x, textY, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'blue';
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#003300';
                ctx.stroke();
                ctx.fill();
                ctx.closePath();

                ctx.font = "12px Arial";
                ctx.fillText(pod.name, x+10, textY);
                textY+=50;
            })
        }

        // Timeline
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(width - 50, 50);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.closePath();
    },[markerSize, width, pods, getEarliestAndLatestPods, dateDiff, getGradiants]);


    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx == null) {
                throw new Error('Could not get context');
            }
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            drawGrid(ctx)
            drawCircle(ctx)
        }       
    },[markerSize, width, drawCircle, drawGrid]);

    return <>
        <canvas ref={canvasRef} height={height} width={width} />
    </>;
};

Canvas.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight,
    markerSize: 0,
    pods: []
};

export default Canvas;
export type { CanvasProps };