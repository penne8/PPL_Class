import * as R from "ramda";
import { State, bind } from "./state";

export type Queue = number[];

export const enqueue = (x: number): State<Queue, undefined> => {
    return (initialQueue: Queue) => [initialQueue.concat(x), undefined];
}

export const dequeue: State<Queue, number> = (initialQueue: Queue) => [R.remove(0, 1, initialQueue), initialQueue[0]];

export const queueManip: State<Queue, number> = bind(bind(dequeue, (x) => bind(enqueue(2 * x), () => enqueue(x / 3))), () => dequeue);