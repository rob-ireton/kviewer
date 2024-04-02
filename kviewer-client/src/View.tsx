import { useState } from 'react';
import { Button } from 'antd';
import Canvas from './Canvas';

const View = () => {
    const [markerSize, updateMarkerSize] = useState(5);
    const [toggleAscend, updateToggleAscend] = useState(true);

    const ascendText = toggleAscend ? "Ascending" : "Descending";

    return <>
        <Button type="primary" onClick={() => updateMarkerSize(prevData=> (prevData+1))}>Inflate</Button>
        <Button type="primary" onClick={() => updateMarkerSize(markerSize-1)}>Deflate</Button>
        <Button type="primary" onClick={() => updateToggleAscend(prevData=> (!prevData))}>{ascendText}</Button>
        <Canvas markerSize={markerSize} ascend={toggleAscend}/>
    </>;
};

export default View;