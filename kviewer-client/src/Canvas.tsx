import React, { useRef, useEffect, useCallback } from 'react';

interface CanvasProps {
    width: number;
    height: number;
    markerSize: number;
}

const Canvas = ({ width, height, markerSize }: CanvasProps) => {
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


    const drawCircle = useCallback((ctx: any) => {
        ctx.beginPath();
        ctx.arc(50, 50, 10+markerSize, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(width - 50, 50);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#003300';
        ctx.stroke();
        ctx.closePath();
    },[markerSize, width]);


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
    height: window.innerHeight
};

export default Canvas;
export type { CanvasProps };