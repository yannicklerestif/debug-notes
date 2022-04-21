export interface Argument {
  callId: string;
  direction: ArgumentDirection;
  name: string;
}

export enum ArgumentDirection { In, Out }
