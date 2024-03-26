import { useState, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import Canvas from './Canvas';
import {ApiResponse} from './services/ApiHandler';
import ApiHandler from './services/ApiHandler';

interface ViewProps {
    width: number;
    height: number;
}

const lowLimit: number = 15, highLimit: number = 30;

const apiHandler = new ApiHandler();

const View = ({ width, height }: ViewProps) => {
    const [markerSize, updateMarkerSize] = useState(0);
    const [limit, setLimit] = useState(highLimit);
    const [pods, setPods] = useState<any>([]);

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
            refreshContent();
        }, 5000);
 
        // Important to clear the interval
        return () => clearInterval(interval);
    }, [limit, markerSize, refreshContent]);



    // useEffect(() => {
    //     refreshContent();
    // }, [refreshContent]);


    return <>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize+1)}>Inflate</Button>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize-1)}>Deflate</Button>
        <Canvas height={height} width={width} markerSize={markerSize} pods={pods}/>
    </>;
};

View.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight
};

export default View;
export type { ViewProps };