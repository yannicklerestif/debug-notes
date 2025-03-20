import { Middleware } from "redux";
import {v4 as uuidv4} from 'uuid';

// Define action types
const START_WORKER = "START_WORKER";
const STOP_WORKER = "STOP_WORKER";
const WORKER_TICK = "WORKER_TICK";

// Define worker actions
interface StartWorkerAction {
    type: typeof START_WORKER;
}

interface StopWorkerAction {
    type: typeof STOP_WORKER;
}

interface WorkerTickAction {
    type: typeof WORKER_TICK;
    payload: string;
}

type WorkerActionTypes = StartWorkerAction | StopWorkerAction | WorkerTickAction;

let connected: boolean = false;
let browserId = uuidv4();

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startPollingLoop() {
    let status = 0;
    console.log("Starting loop...");
    while (status == 0) {
        try {
            const connect = !connected;
            const response = await fetch(`http://localhost:5151/api/browser/wait_for_message?`
                + `userId=12345&browserId=${browserId}&connect=${connect}`);
            if (response.status != 200) {
                await wait(5000);
                continue;
            }
            connected = true;
            // status = 0: connected
            const data = await response.json();
            status = data.state;
            if (status == 0) {
                const message = data.message;
                if (message == null) {
                    // This is the "regular" timeout, just keep polling
                    console.log("No data, continuing...");
                    continue;
                }
                // There is some data: let's process it
                // TODO: It's a little weird to use methods registered into window like this,
                //       but that's how it was done before (because of the CEF browser)
                //       so I'm keeping it for now.
                if (message.Parent != null) {
                    // message.Parent != null: this is a call
                    (window! as any).lazilyAddCall({
                        sourceMethod: {
                            namespace: message.Parent.Namespace,
                            clazzName: message.Parent.ClassName,
                            methodName: message.Parent.MethodName,
                        }, targetMethod: {
                            namespace: message.Method.Namespace,
                            clazzName: message.Method.ClassName,
                            methodName: message.Method.MethodName,
                        }
                    });
                } else {
                    // Otherwise, this is a method
                    (window! as any).lazilyAddMethod({
                        namespace: message.Namespace,
                        clazzName: message.ClassName,
                        methodName: message.MethodName,
                    });
                }
            } else {
                // status = 1 or 2: disconnecting.
                // TODO: Ack the disconnect so the server can clean up
                console.log("Disconnecting...");
            }
        } catch (e) {
            console.error("Error waiting for message. Waiting 5 seconds before starting again.", e);
            await wait(5000);
        }
    }
}

// Worker Middleware
const ideListenerMiddleware: Middleware = (store) => {
    let intervalId: NodeJS.Timeout | null = null;

    startPollingLoop();
    
    return (next) => (action: WorkerActionTypes) => {
        /*switch (action.type) {
            case START_WORKER:
                if (!intervalId) {
                    console.log("Worker started...");
                    intervalId = setInterval(() => {
                        console.log("Worker tick...");
                        store.dispatch({ type: WORKER_TICK, payload: new Date().toISOString() });
                    }, 5000);
                }
                break;

            case STOP_WORKER:
                if (intervalId) {
                    console.log("Worker stopped...");
                    clearInterval(intervalId);
                    intervalId = null;
                }
                break;

            default:
                break;
        }
*/
        return next(action);
    };
};

export default ideListenerMiddleware;
export { START_WORKER, STOP_WORKER, WORKER_TICK };