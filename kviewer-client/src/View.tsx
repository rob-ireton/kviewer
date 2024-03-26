import { useState } from 'react';
import { Button } from 'antd';
import Canvas from './Canvas';

interface ViewProps {
    width: number;
    height: number;
}

// const lowLimit: number = 15, highLimit: number = 30;

const View = ({ width, height }: ViewProps) => {
    const [markerSize, updateMarkerSize] = useState(5);
    const [toggleAscend, updateToggleAscend] = useState(true);
    // const [limit, setLimit] = useState(highLimit);

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if(limit === highLimit){
    //             updateMarkerSize(markerSize + 1);
    //         } else {
    //             updateMarkerSize(markerSize - 1);
    //         }
    //         if(markerSize === highLimit){
    //             setLimit(lowLimit);
    //         } else if(markerSize === lowLimit){
    //             setLimit(highLimit);
    //         }
    //     }, 5000);
 
    //     // Important to clear the interval
    //     return () => clearInterval(interval);
    // }, [limit, markerSize]);

    const ascendText = toggleAscend ? "Ascending" : "Descending";

    return <>
        <Button type="primary" onClick={() => updateMarkerSize(prevData=> (prevData+1))}>Inflate</Button>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize-1)}>Deflate</Button>
        <Button type="primary" onClick={() => updateToggleAscend(prevData=> (!prevData))}>{ascendText}</Button>
        <Canvas height={height} width={width} markerSize={markerSize} ascend={toggleAscend}/>
    </>;
};

View.defaultProps = {
    width: window.innerWidth,
    height: window.innerHeight
};

export default View;
export type { ViewProps };