import { useState, useCallback, useEffect } from 'react';
import { Button, Checkbox, Dropdown, Collapse } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import Canvas from './Canvas';
import './view.css';
import {ApiResponse} from './services/ApiHandler';
import ApiHandler from './services/ApiHandler';

const apiHandler = new ApiHandler();

const contentTypeItems = [
  {
    label: "pods",
    key: "1",
  },
  {
    label: "deployments",
    key: "2",
  },
  {
    label: "events",
    key: "3",
  }
];

const View = () => {
    const [markerSize, updateMarkerSize] = useState(5);
    const [toggleAscend, updateToggleAscend] = useState(true);
    const [trailingLines, updateTrailingLines] = useState(true);
    const [contentArray, setContentArray] = useState<any>([]);
    const [timePropName, setTimePropName] = useState<string>("startTime");
    const [contentType, setContentType] = useState<string>(contentTypeItems[0].label);

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
        let response = null;
        switch (contentType) {
            case "pods":
                response = apiHandler.listPods();
                break;
            case "deployments":
                response = apiHandler.listDeployments();
                break;
            case "events":
                response = apiHandler.listCurrentEvents();
                break;
        }

        // Resolve the promise and handle any errors
        if (response) {
            response
                .then((resp: ApiResponse) => {
                    // If the arrays are different then update. This is a simple way to check for changes
                    // and update the state only when necessary.
                    if (JSON.stringify(contentArray) !== JSON.stringify(resp.data)){
                        setContentArray(resp.data);
                        console.log(resp.data)
                    }
                })
                .catch((error) => console.log(error));
        }
    }, [setContentArray, contentArray, contentType]);

    // This useEffect is for the contentType changes to ripple through
    useEffect(() => {
        switch (contentType) {
            case "pods":
                setTimePropName("startTime");
                refreshContent();
                break
            case "deployments":
                setTimePropName("creationTime");
                refreshContent();
                break;
        }
    }, [contentType, refreshContent]);

    // This useEffect is for the refresh of content
    useEffect(() => {
        const interval = setInterval(() => {
            refreshContent();
        }, 5000);

        // Important to clear the interval
        return () => clearInterval(interval);
    }, [refreshContent]);

    const handleButtonClick = (e: any) => {
        console.log('click button', e);
      };

    const handleMenuClick = (e: any) => {
        const item = contentTypeItems.find((element) => element.key === e.key);
        if (item) {
            setContentType(item.label);
        }
      };
    const menuProps = {
        items: contentTypeItems,
        onClick: handleMenuClick,
      };

     useEffect(() => {
        refreshContent();
     }, [trailingLines, refreshContent]);

    const expanderItems = [
        {
            key: '1',
            label: 'View Settings',
            children: 
            <>
                <Button type="primary" onClick={() => updateMarkerSize(prevData=> (prevData+1))}>Inflate</Button>
                <Button type="primary" onClick={() => updateMarkerSize(markerSize-1)}>Deflate</Button>
                <Button type="primary" onClick={() => updateToggleAscend(prevData=> (!prevData))}>{ascendText}</Button>
                <Checkbox id="trailingSpace" checked={trailingLines} onChange={(e) => { updateTrailingLines(e.target.checked);}}>Trailing lines</Checkbox>
                <Dropdown.Button data-testid="dataType" menu={menuProps} onClick={handleButtonClick}
                    placement="bottom"
                    arrow={{
                        pointAtCenter: true,
                    }}>
                        {contentType}
                </Dropdown.Button> 
            </>,
            extra: <SettingOutlined/>,
        }
    ];

    return <>
        <Collapse
            defaultActiveKey={['1']}
            items={expanderItems}
            size="small"
        />
        <Canvas
            markerSize={markerSize}
            ascend={toggleAscend}
            trailingLines={trailingLines}
            contentArray={contentArray}
            getEarliestAndLatestContent={getEarliestAndLatestContent}
            timePropName={timePropName}
        />
    </>;
};

export default View;