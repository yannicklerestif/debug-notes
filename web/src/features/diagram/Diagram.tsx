import {useAppDispatch, useAppSelector} from '../../@app/hooks';
import React, {useEffect} from "react";
import {Cell, Edge, Graph, Node} from '@antv/x6';

import {selectDiagramModel} from "./diagramModel";
import {moveMethods} from '../method/methodSlice';
import {addCall} from '../call/callSlice';
import {MoveEvent} from "./moveEvent";
import {selectDeselectCells, SelectionEvent, SelectionEventType} from '../selection/selectionSlice';

import styles from './Diagram.module.css';

let graph: Graph | null = null;

const movingNodes: Record<string, MoveEvent> = {};
let movedNodes: Record<string, MoveEvent> = {};

let isRebuildingGraph: boolean = false;

export interface GraphContainer {
  graph: Graph | null;
}

export const graphContainer: GraphContainer = { graph: null };

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
      if (movedNodeEvent.type === 'method') {
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
    const { type: outType, id: sourceMethodId } = parseTypeAndId(edge.getSourceCellId());
    const { type: inType, id: targetMethodId } = parseTypeAndId(edge.getTargetCellId());
    if (inType !== 'method' || outType !== 'method') {
      console.error('Wrong source or destination type: ', edge.getSource(), edge.getTarget());
      return;
    }
    dispatch(addCall({ callId: undefined, targetMethodId, sourceMethodId }));
  }

  let inProgressSelectDeselect: SelectionEvent[] = [];

  // TODO: kind of a workaround, maybe wouldn't be needed if only the modified part of the diagram was updated
  // The reason this method exists is because when multiple objects
  // are moved together, we don't receive one global event but multiple
  // individual events.
  // Because each dispatched action makes us rebuild the whole graph,
  // dispatching a lot of events takes a long time.
  // This allows us to stack these events and then send a single action.
  const dispatchLater = (selectionEvent: SelectionEvent) => {
    inProgressSelectDeselect.push(selectionEvent);
    if (inProgressSelectDeselect.length !== 1) {
      // we are not the first, nothing more to do
      return;
    }
    setTimeout(() => {
      const toDispatch = inProgressSelectDeselect;
      inProgressSelectDeselect = [];
      dispatch(selectDeselectCells(toDispatch))
    }, 100)
  }

  const handleCellSelected = (cell: Cell) => {
    if (isRebuildingGraph)
      return;
    const { type, id } = parseTypeAndId(cell.id);
    console.log(`selecting ${type}, ${id}`);
    dispatchLater({selectionEventType: SelectionEventType.Select, type, id});
  }

  const handleCellUnselected = (cell: Cell) => {
    if (isRebuildingGraph)
      return;
    const { type, id } = parseTypeAndId(cell.id);
    console.log(`unselecting ${type}, ${id}`);
    dispatchLater({selectionEventType: SelectionEventType.Deselect, type, id});
  }

  const handleWindowResize = (graph: Graph) => {
    const width = document.getElementById('diagram-outer-container')!.clientWidth;
    const height = document.getElementById('diagram-outer-container')!.clientHeight;
    graph!.resize(width, height);
  }

  useEffect(() => {
    if (graph == null) {
      graph = new Graph({
        container: document.getElementById('diagram-container')!,
        grid: {visible: true},
        autoResize: true,
        selecting: {
          enabled: true,
          movable: true,
          strict: true,
          rubberband: true,
          showNodeSelectionBox: true,
          // disabled because it doesn't look very nice ATM
          // (it's a box around bounds the edge)
          showEdgeSelectionBox: false,
          multiple: true,
        },
        scroller: {
          enabled: true,
          autoResize: true,
        },
        interacting: {
          arrowheadMovable: true,
          nodeMovable: true,
        }
      });
      graphContainer.graph = graph;
      graph.on('cell:selected', (args: {
        cell: Cell
      }) => {
        handleCellSelected(args.cell);
      });
      graph.on('cell:unselected', (args: {
        cell: Cell
      }) => {
        handleCellUnselected(args.cell);
      });
      graph.on("node:move",
        ({x, y, node}) => {
        const position = node.getPosition();
        console.log('start moving', x, y, node.id, position);
          startMoving(position.x, position.y, node);
        });
      graph.on('node:moved',
        ({x, y, node}) => {
          const position = node.getPosition();
          console.log('end moving  ', x, y, node.id, position);
          endMoving(position.x, position.y, node);
        });
      graph.on('edge:connected', ({ edge }) => {
        console.log(edge);
        handleEdgeConnected(edge);
      });
      // workaround to resize the scrolling area when the window is resized.
      // see https://github.com/antvis/X6/discussions/1913
      window.addEventListener('resize', () => handleWindowResize(graph!));
    }

    isRebuildingGraph = true;

    graph.clearCells();

    for (let clazz of Object.values(diagramModel.diagramClazzes)) {
      const isClazzSelected = !!diagramModel.selectedObjects.selectedClazzes[clazz.clazzId!];

      // @ts-ignore
      if(isClazzSelected && window.JavaPanelBridge !== undefined) {
          // @ts-ignore
          window.JavaPanelBridge.clickClass(`${clazz.namespace}:${clazz.clazzName}`);
      }

      const node = graph.addNode(
        {
          shape: 'html',
          id: 'clazz_' + clazz.clazzId,
          x: clazz.x,
          y: clazz.y,
          width: clazz.textWidth,
          height: clazz.textHeight,
          zIndex: 1,
          html: () => {
            const background = document.createElement('div')
            background.style.width = `${clazz.width}px`;
            background.style.height = `${clazz.height}px`;
            background.style.border = '2px solid #000';
            background.style.background = '#2ECC71';
            background.style['pointerEvents'] = 'none';
            const text = document.createElement('span')
            text.innerText = clazz.clazzName + '\n' + clazz.namespace;
            text.setAttribute('class', 'clazz-text')
            text.style.position = 'absolute';
            text.style.textAlign = 'left';
            text.style.left = '0';
            text.style.top = '0';
            text.style.padding = '10px';
            text.style.width = `${clazz.textWidth - 20}px`;
            text.style.height = `${clazz.textHeight - 20}px`;
            background.appendChild(text)
            return background;
          },
        });
      if (isClazzSelected)
        graph.select(node);
      node.on('node:batch:stop', (e: any, f: any) => console.log('node event', e, f));
    }

    for (let method of Object.values(diagramModel.diagramMethods)) {
      const isMethodSelected = !!diagramModel.selectedObjects.selectedMethods[method.methodId!];

      // @ts-ignore
      if(isMethodSelected && window.JavaPanelBridge !== undefined) {
          console.log(method);
          var parentClazz = diagramModel.diagramClazzes[method.classId];
          console.log(diagramModel.diagramClazzes);
          console.log(parentClazz);
          // @ts-ignore
          window.JavaPanelBridge.clickMethod(`${parentClazz.namespace}:${parentClazz.clazzName}:${method.methodName}`);
      }

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
          },
          attrs: {
            rect: {
              // use built-in selection box
              // keeping it in case I change my mind
              // 'stroke-dasharray': isMethodSelected ? '5,5' : undefined,
            },
            text: {
              // TODO: This must now be duplicated to TextMeasurer.module.css so that the text measuring method works.
              'font-size': 14,
              'font-family': 'Arial, helvetica, sans-serif',
            }
          },
        }
      );
      const parent = graph.getCellById('clazz_' + method.classId);
      parent.addChild(child);
      if (isMethodSelected)
        graph.select(child);
    }

    for (let call of Object.values(diagramModel.diagramCalls)) {
      const isCallSelected = !!diagramModel.selectedObjects.selectedCalls[call.callId!];
      const sourceNode = graph.getCellById('method_' + call.sourceMethodId);
      const targetNode = graph.getCellById('method_' + call.targetMethodId);
      const edge = graph.addEdge({
        id: 'call_' + call.callId,
        source: { cell: sourceNode, port: 'out1' },
        target: { cell: targetNode, port: 'in1' },
        // router: {
        //   name: 'manhattan',
        //   args: {
        //     startDirections: ['right'],
        //     endDirections: ['left'],
        //   },
        // },
        connector: {
          name: 'rounded',
          args: {},
        },
        attrs: {
          line: {
            'stroke': isCallSelected ? '#feb663' : '#000',
            'stroke-dasharray': isCallSelected ? '5,5' : undefined,
          },
        },
      });
      if (isCallSelected) {
        graph.select(edge);
      }
    }

    isRebuildingGraph = false;
  });

  return (
      <div id="diagram-outer-container" className={styles.DiagramOuterContainer}>
        <div id="diagram-container" className={styles.Diagram}/>
      </div>
  );
}
