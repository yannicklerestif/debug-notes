// I'm denormalizing for now, nested objects might be a paint to ser/deser
export interface LazyMethod {
    namespace: string;
    clazzName: string;
    methodName: string;
    width?: number | undefined;
    height?: number | undefined;
    clazzTextWidth?: number | undefined;
    clazzTextHeight?: number | undefined;
}
