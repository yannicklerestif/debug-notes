// *not* denormalizing for now :)
// that's probably not what we'll start with so keep it simple

import {LazyMethod} from "./lazyMethod";

export interface LazyCall {
    sourceMethod: LazyMethod;
    targetMethod: LazyMethod;
}
