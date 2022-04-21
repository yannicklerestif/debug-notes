import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {NearMe, PanTool } from '@material-ui/icons';
import { graphContainer} from "../Diagram";
import {Graph} from "@antv/x6";

export default function ToggleButtons() {
    const [tool, setTool] = React.useState<string | null>('select');

    const handleTool = (event: React.MouseEvent<HTMLElement>, newTool: string | null) => {
        const graph: Graph = graphContainer.graph!;
        if (newTool === 'select') {
            graph.disablePanning();
            graph.enableRubberband();
        } else {
            // newTool === 'pan'
            graph.enablePanning();
            graph.disableRubberband();
        }
        setTool(newTool);
    };

    return (
        <ToggleButtonGroup
            value={tool}
            exclusive
            onChange={handleTool}
        >
            <ToggleButton value="select">
                <NearMe />
            </ToggleButton>
            <ToggleButton value="pan">
                <PanTool />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
