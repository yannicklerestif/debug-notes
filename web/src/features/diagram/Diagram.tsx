import {useAppDispatch, useAppSelector} from '../../@app/hooks';
import React, {useEffect} from "react";
import {Cell, CellView, Edge, Graph, Node} from '@antv/x6';

import {selectDiagramModel} from "./diagramModel";
import {selectNamespacesMap} from "../namespace/namespaceSlice";
import {selectClazzes} from '../clazz/clazzSlice';
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
  const allClazzes = useAppSelector(selectClazzes);
  const allNamespaces = useAppSelector(selectNamespacesMap);
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
    dispatchLater({selectionEventType: SelectionEventType.Select, type, id});
  }

  const handleCellUnselected = (cell: Cell) => {
    if (isRebuildingGraph)
      return;
    const { type, id } = parseTypeAndId(cell.id);
    dispatchLater({selectionEventType: SelectionEventType.Deselect, type, id});
  }

  const handleWindowResize = (graph: Graph) => {
    const width = document.getElementById('diagram-outer-container')!.clientWidth;
    const height = document.getElementById('diagram-outer-container')!.clientHeight;
    graph!.resize(width, height);
  }

  // @ts-ignore
  const handleNavigateToClazz = (event: any, clazz: Clazz) => {
    const qualifiedClassName = `${clazz.namespace}:${clazz.clazzName}`;
    // @ts-ignore
    if (window.JavaPanelBridge === undefined)
      return;
    // @ts-ignore
    window.JavaPanelBridge.clickClass(qualifiedClassName);
  }

  // @ts-ignore
  const handleNavigateToMethod = (event: any, method: Method) => {
    const parentClazz = diagramModel.diagramClazzes[method.classId];
    const qualifiedMethodName = `${parentClazz.namespace}:${parentClazz.clazzName}:${method.methodName}`;
    // @ts-ignore
    if (window.JavaPanelBridge === undefined)
      return;
    // @ts-ignore
    window.JavaPanelBridge.clickMethod(qualifiedMethodName);
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
          filter: (node) => {
            // @ts-ignore
            return !node.id.startsWith('fake_');
          }
        },
        scroller: {
          enabled: true,
          autoResize: true,
        },
        interacting: {
          arrowheadMovable: true,
          nodeMovable: function(cellView: CellView) {
            return !cellView.cell.id.startsWith('fake_');
          },
        },
        connecting: {
          // preventing linking to anything other than methods.
          validateEdge: function({edge}) {
            const cell = (edge as any)?.target?.cell as string;
            const {type, id} = parseTypeAndId(cell);
            if (type !== 'method')
              return false;
            // (hacky) methods links are actually nodes, whose id start with method_link_ => excluding that too
            return !id.startsWith('fake_');
          }
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
          startMoving(position.x, position.y, node);
        });
      graph.on('node:moved',
        ({x, y, node}) => {
          const position = node.getPosition();
          endMoving(position.x, position.y, node);
        });
      graph.on('edge:connected', ({ edge }) => {
        handleEdgeConnected(edge);
      });
      // workaround to resize the scrolling area when the window is resized.
      // see https://github.com/antvis/X6/discussions/1913
      window.addEventListener('resize', () => handleWindowResize(graph!));
    }

    isRebuildingGraph = true;

    graph.clearCells();

    // if we don't have any methods, the diagram will be empty.
    // we show an information panel helping the user getting started
    if (Object.keys(diagramModel.diagramMethods).length === 0) {
      let placeHolderInnerHtml =
        `Please use the editor's context menu<br>
        to add classes and methods to the diagram,</br>`
      if (Object.keys(allNamespaces).length === 0) {
        placeHolderInnerHtml += 'or manually add a namespace to add classes to.';
      } else if (Object.keys(allClazzes).length === 0) {
        placeHolderInnerHtml += 'or manually add a class to add methods to.'
      } else {
        placeHolderInnerHtml += 'or manually add methods.'
      }
      const placeHolderWidth = 400;
      const placeHolderHeight = 100;
      let visibleArea = graph.scroller.widget?.getVisibleArea()!;
      const placeHolderX = visibleArea.x + visibleArea.width / 2 - placeHolderWidth / 2;
      const placeHolderY = visibleArea.y + visibleArea.height / 2 - placeHolderHeight / 2;
      graph.addNode(
        {
          shape: 'html',
          id: 'fake_placeholder',
          x: placeHolderX,
          y: placeHolderY,
          width: placeHolderWidth,
          height: placeHolderHeight,
          html: () => {
            const placeholder = document.createElement('div')
            placeholder.innerHTML = `<div class="placeholder">${placeHolderInnerHtml}</div>`
            placeholder.className = 'placeholder-container'
            return placeholder;
          },
        }
      )
    }

    for (let clazz of Object.values(diagramModel.diagramClazzes)) {
      const isClazzSelected = !!diagramModel.selectedObjects.selectedClazzes[clazz.clazzId!];

      // ------------------------------------------------------------------------------------------
      //                                 CLAZZES
      // ------------------------------------------------------------------------------------------
      const node = graph.addNode(
        {
          shape: 'html',
          id: 'clazz_' + clazz.clazzId,
          x: clazz.x,
          y: clazz.y,
          // this is the width of the draggable part of the clazz. if the clazz text is narrower than the clazz
          // (because there are methods further right), it is not bigger than the text
          // 40 + 10 + 5: 40 for the link icon on the left + 10 padding right + 5 just to wiggle room to avoid wrapping
          width: clazz.textWidth + 40 + 10 + 5,
          height: clazz.textHeight + 20, // +20 for padding top and bottom
          zIndex: 1,
          html: () => {
            const background = document.createElement('div')

            background.style.width = `${clazz.width!}px`;
            background.style.height = `${clazz.height!}px`;
            background.className = 'diagram-clazz-background'
            background.innerHTML = `
<span class="clazz-text diagram-clazz-draggable-text" style="width:${clazz.textWidth}px; height: ${clazz.textHeight}px;">
  ${clazz.clazzName}<br>${clazz.namespace}
</span>`
            return background;
          },
        });
      if (isClazzSelected)
        graph.select(node);

      const clazzLink = graph.addNode(
        {
          shape: 'html',
          id: 'fake_clazz_link_' + clazz.clazzId,
          x: clazz.x,
          y: clazz.y,
          width: 30,
          height: clazz.textHeight + 20, // 20 for padding * 2
          html: () => {
            const linkElement = document.createElement('div')
            linkElement.onclick = (event) => {
              handleNavigateToClazz(event, clazz);
            }
            linkElement.className = 'diagram-link';
            linkElement.innerHTML = `<img src="/arrow-up-right-from-square-solid.svg" class="diagram-link-icon" alt="link" />`
            return linkElement;
          }
        });

      node.addChild(clazzLink);
      node.on('node:batch:stop', (e: any, f: any) => console.log('node event', e, f));
    }

    // ------------------------------------------------------------------------------------------
    //                                 METHODS
    // ------------------------------------------------------------------------------------------
    for (let method of Object.values(diagramModel.diagramMethods)) {
      const isMethodSelected = !!diagramModel.selectedObjects.selectedMethods[method.methodId!];

      // @ts-ignore
      if(isMethodSelected && window.JavaPanelBridge !== undefined) {
          var parentClazz = diagramModel.diagramClazzes[method.classId];
          // @ts-ignore
          window.JavaPanelBridge.clickMethod(`${parentClazz.namespace}:${parentClazz.clazzName}:${method.methodName}`);
      }

      const child = graph.addNode(
        {
          shape: 'html',
          id: 'method_' + method.methodId,
          x: method.x,
          y: method.y,
          width: method.width + 40 + 10 + 3 * 2, // 40 + 10: size of the link + padding right
          height: method.height + 20, // 20: padding
          html: () => {
            const background = document.createElement('div')
            background.style.width = `${method.width! + 3 + 40 + 10 + 3}px`; // 40 + 10: link + padding right
                                                                             // 5 * 2 additional padding for link anchors
            background.style.height = `${method.height! + 20}px`; // 20: padding
            background.className = 'diagram-method-background'
            background.innerHTML = `<span class="clazz-text diagram-method-draggable-text">${method.methodName}</span>`
            return background;
          },
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
        }
      );

      const methodLink = graph.addNode(
        {
          shape: 'html',
          id: 'fake_method_link_' + method.methodId,
          x: method.x! + 3,
          y: method.y,
          width: 30,
          height: method.height + 20, // 20: padding
          html: () => {
            const linkElement = document.createElement('div')
            linkElement.onclick = (event) => {
              handleNavigateToMethod(event, method);
            }
            linkElement.className = 'diagram-link';
            linkElement.innerHTML = `<img src="/arrow-up-right-from-square-solid.svg" class="diagram-link-icon" alt="link" />`
            return linkElement;
          }
        });

      const parent = graph.getCellById('clazz_' + method.classId);
      parent.addChild(child);
      if (isMethodSelected)
        graph.select(child);
      child.addChild(methodLink);
    }

    // ------------------------------------------------------------------------------------------
    //                                 CALLS
    // ------------------------------------------------------------------------------------------
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
