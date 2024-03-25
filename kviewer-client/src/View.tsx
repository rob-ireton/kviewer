import { useState, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import Canvas from './Canvas';
import ApiHandler from './services/ApiHandler';

interface ViewProps {
    width: number;
    height: number;
}

const lowLimit: number = 20, highLimit: number = 40;

const apiHandler = new ApiHandler();

const View = ({ width, height }: ViewProps) => {
    const [markerSize, updateMarkerSize] = useState(0);
    const [limit, setLimit] = useState(highLimit);

    useEffect(() => {
        const interval = setInterval(() => {
            if(limit === highLimit){
                updateMarkerSize(markerSize + 1);
            } else {
                updateMarkerSize(markerSize - 1);
            }
            if(markerSize === highLimit){
                setLimit(lowLimit);
            } else if(markerSize === lowLimit){
                setLimit(highLimit);
            }
        }, 1000);
 
        // Important to clear the interval
        return () => clearInterval(interval);
    }, [limit, markerSize]);

    const refreshContent = useCallback(async () => {
        const response = apiHandler.listPods();
        // Resolve the promise and handle any errors
        response
            .then((data) => console.log(data.data))
            .catch((error) => console.log(error));
    }, []);

    useEffect(() => {
        refreshContent();
    }, [refreshContent]);


    return <>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize+1)}>Inflate</Button>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize-1)}>Deflate</Button>
        <Canvas height={height} width={width} markerSize={markerSize} />
    </>;
};

View.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight
};

export default View;
export type { ViewProps };