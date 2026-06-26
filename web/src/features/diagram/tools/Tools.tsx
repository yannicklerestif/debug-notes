import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {NearMe, PanTool } from '@mui/icons-material';
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
            <ToggleButton size='small' value="select">
                <NearMe />
            </ToggleButton>
            <ToggleButton size='small' value="pan">
                <PanTool />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
