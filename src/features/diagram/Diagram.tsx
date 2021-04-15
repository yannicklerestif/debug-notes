import {useAppSelector, useAppDispatch} from '../../@app/hooks';
import React, {useEffect} from "react";
import {Edge, Graph, Node} from '@antv/x6';

import {selectDiagramModel} from "./diagramModel";
import {moveMethods} from '../method/methodSlice';
import {addCall} from '../call/callSlice';
import {MoveEvent} from "./moveEvent";

let graph: Graph | null = null;

const movingNodes: Record<string, MoveEvent> = {};
let movedNodes: Record<string, MoveEvent> = {};

export function Diagram() {
  const diagramModel = useAppSelector(selectDiagramModel);
  const dispatch = useAppDispatch();

  const parseTypeAndId = (diagramId: string) => {
    const typeStartIndex: number = diagramId.indexOf('_');
    return {type: diagramId.substring(0, typeStartIndex), id: diagramId.substring(typeStartIndex + 1)};
  }

  const startMoving = (x: number, y: number, node: Node) => {
    const diagramId = node.id;
    const {type, id} = parseTypeAndId(diagramId);
    const event: MoveEvent = {
      oldX: x, oldY: y, diagramId, type: type as any, id, x: undefined, y: undefined
    }
    movingNodes[diagramId] = event;
  }

  const endMoving = (x: number, y: number, node: Node) => {
    const diagramId = node.id;
    const movingNodeEvent = movingNodes[diagramId];
    movingNodeEvent.x = x;
    movingNodeEvent.y = y;
    delete movingNodes[diagramId];
    movedNodes[diagramId] = movingNodeEvent;
    // there are still moving nodes, we stop here
    if (Object.keys(movingNodes).length > 0)
      return;
    // otherwise this was the last event, process them
    const movedNodeEventsByMethodId: Record<string, MoveEvent> = {};
    for (let diagramId in movedNodes) {
      const movedNodeEvent: MoveEvent = movedNodes[diagramId];
      // if it's a method, add it
      if (movedNodeEvent.type == 'method') {
        movedNodeEventsByMethodId[movedNodeEvent.id] = movedNodeEvent;
        continue;
      }
      // if it's a class, add all its methods
      for (let child of graph!.getCellById(diagramId).children!) {
        const {type, id} = parseTypeAndId(child.id);
        // only take methods, that will move calls
        if (type !== 'method')
          continue;
        movedNodeEventsByMethodId[id] = {
          oldX: movedNodeEvent.oldX,
          oldY: movedNodeEvent.oldY,
          diagramId: child.id,
          type: 'method',
          id,
          x: movedNodeEvent.x,
          y: movedNodeEvent.y
        }
      }
    }
    dispatch(moveMethods(Object.values(movedNodeEventsByMethodId)));
    movedNodes = {};
  }

  const handleEdgeConnected = (edge: Edge) => {
    const { type: outType, id: outMethodId } = parseTypeAndId(edge.getSourceCellId());
    const { type: inType, id: inMethodId } = parseTypeAndId(edge.getTargetCellId());
    if (inType !== 'method' || outType !== 'method') {
      console.error('Wrong source or destination type: ', edge.getSource(), edge.getTarget());
      return;
    }
    dispatch(addCall({ callId: undefined, inMethodId, outMethodId }));
  }

  useEffect(() => {
    if (graph == null) {
      graph = new Graph({
        container: document.getElementById('diagram-container')!,
        grid: {visible: true},
        width: 800,
        height: 600,
        selecting: {
          enabled: true,
          movable: true,
          strict: true,
          rubberband: true,
          // showNodeSelectionBox: true,
          multiple: true,
        },
      });
      graph.on("node:selected", (e: any) => {
      })
      graph.on("node:unselected", (e: any) => {
      })
      graph.on("node:move",
        ({x, y, node}) => {
          console.log('start moving', x, y, node.id);
          startMoving(x, y, node);
        });
      graph.on('node:moved',
        ({x, y, node}) => {
          console.log('end moving  ', x, y, node.id);
          endMoving(x, y, node);
        });
      graph.on('edge:connected', ({ edge }) => {
        console.log(edge);
        handleEdgeConnected(edge);
      });
    }
    graph.clearCells();

    for (let clazz of Object.values(diagramModel.diagramClazzes)) {
      const node = graph.addNode(
        {
          id: 'clazz_' + clazz.clazzId,
          x: clazz.x,
          y: clazz.y,
          width: clazz.width,
          height: clazz.height,
          zIndex: 1,
          label: clazz.clazzName + '\n' + clazz.namespace,
          attrs: {
            rect: {
              fill: '#2ECC71',
              stroke: '#000',
            },
            text: {
              x: '5',
              y: '5',
              refX: '0',
              refY: '0',
              textAnchor: 'left',
              textVerticalAnchor: 'top'
            },
          },
        });
      node.on('node:batch:stop', (e: any, f: any) => console.log('node event', e, f));
    }

    for (let method of Object.values(diagramModel.diagramMethods)) {
      const child = graph.addNode(
        {
          id: 'method_' + method.methodId,
          x: method.x,
          y: method.y,
          width: method.width,
          height: method.height,
          label: method.methodName,
          ports: {
            groups: {
              in: {position: 'left', attrs: {circle: {r: 6, magnet: true,},},},
              out: {position: 'right', attrs: {circle: {r: 6, magnet: true,},},},
            },
            items: [
              {id: 'in1', group: 'in',},
              {id: 'out1', group: 'out',},
            ],
          }
        }
      );
      const parent = graph.getCellById('clazz_' + method.classId);
      parent.addChild(child);
    }

    for (let call of Object.values(diagramModel.diagramCalls)) {
      const sourceNode = graph.getCellById('method_' + call.outMethodId);
      const targetNode = graph.getCellById('method_' + call.inMethodId);
      graph.addEdge(graph.addEdge({
        id: 'call_' + call.callId,
        source: { cell: sourceNode, port: 'out1' },
        target: { cell: targetNode, port: 'in1' },
      }))
    }
  });

  return (
    <div id="diagram-container"/>
  );
}