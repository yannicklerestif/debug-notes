import { Middleware } from "redux";
import {v4 as uuidv4} from 'uuid';

// Define action types
const START_WORKER = "START_WORKER";
const STOP_WORKER = "STOP_WORKER";
const WORKER_TICK = "WORKER_TICK";

// Hardcoding the user Id for now. Next step this will need to be created and shared with clients
let userId = "12345";
let browserId = uuidv4();

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startPollingLoop() {
    console.log("Starting loop...");
    while (true) {
        try {
            const query = new URLSearchParams({userId, browserId,});
            const response = await fetch(`/api/browser/messages?${query}`);
            if (!response.ok) {
                await wait(5000);
                continue;
            }

            const messages = await response.json();
            for (const message of messages) {
                // There is some data: let's process it
                // TODO: It's a little weird to use methods registered into window like this,
                //       but that's how it was done before (because of the CEF browser)
                //       so I'm keeping it for now.
                if (message.Parent !== null && message.Parent !== undefined) {
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
            }
        } catch (e) {
            console.error("Error waiting for message. Waiting 5 seconds before starting again.", e);
            await wait(5000);
        }
    }
}

// Worker Middleware
const ideListenerMiddleware: Middleware = () => {
    startPollingLoop();
    
    return (next) => (action: unknown) => {
        return next(action);
    };
};

export default ideListenerMiddleware;
export { START_WORKER, STOP_WORKER, WORKER_TICK };
