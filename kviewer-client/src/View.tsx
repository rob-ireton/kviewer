import { useState, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import Canvas from './Canvas';
import {ApiResponse} from './services/ApiHandler';
import ApiHandler from './services/ApiHandler';

const apiHandler = new ApiHandler();

const View = () => {
    const [markerSize, updateMarkerSize] = useState(5);
    const [toggleAscend, updateToggleAscend] = useState(true);
    const [contentArray, setContentArray] = useState<any>([]);
    const [timePropName, setTimePropName] = useState<string>("startTime");

    const ascendText = toggleAscend ? "Ascending" : "Descending";

    const getEarliestAndLatestContent = useCallback(() => {
        if(contentArray && contentArray.length > 0){    
            let earliestContent = contentArray[0];
            let earliestTime = new Date(earliestContent[timePropName]);
            let latestContent = contentArray[0];
            let latestTime = new Date(latestContent[timePropName]);
            contentArray.forEach((item: any) => {
                let itemTime = new Date(item[timePropName]);
                if (itemTime < earliestTime){
                    earliestTime = itemTime;
                    earliestContent = item;
                }
                if (itemTime > latestTime){
                    latestTime = itemTime;
                    latestContent = item;
                }
            });
            return [earliestContent, latestContent];
        }
        return [];        
    },[contentArray, timePropName]);

    // This is the actual function that will be called to refresh the content via server
    const refreshContent = useCallback(async () => {
        const response = apiHandler.listPods();
        // Resolve the promise and handle any errors
        response
            .then((resp: ApiResponse) => {
                // If the arrays are different then update. This is a simple way to check for changes
                // and update the state only when necessary.
                if (JSON.stringify(contentArray) !== JSON.stringify(resp.data)){
                    setContentArray(resp.data);
                    setTimePropName("startTime");
                    console.log(resp.data)
                }
            })
            .catch((error) => console.log(error));
    }, [setContentArray, contentArray, setTimePropName]);

    // This useEffect is for the refresh of content
    useEffect(() => {
        const interval = setInterval(() => {
            refreshContent();
        }, 5000);
    
        // Important to clear the interval
        return () => clearInterval(interval);
    }, [refreshContent]);

    return <>
        <Button type="primary" onClick={() => updateMarkerSize(prevData=> (prevData+1))}>Inflate</Button>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize-1)}>Deflate</Button>
        <Button type="primary" onClick={() => updateToggleAscend(prevData=> (!prevData))}>{ascendText}</Button>
        <Canvas
            markerSize={markerSize}
            ascend={toggleAscend}
            contentArray={contentArray}
            getEarliestAndLatestContent={getEarliestAndLatestContent}
            timePropName={timePropName}
        />
    </>;
};

export default View;