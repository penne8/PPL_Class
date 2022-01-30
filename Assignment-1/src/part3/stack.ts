import * as R from "ramda";
import { State, bind } from "./state";

export type Stack = number[];

export const push = (x: number): State<Stack, undefined> => {
    return (initialStack: Stack) => [R.insert(0, x, initialStack), undefined];
}

export const pop: State<Stack, number> = (initialStack: Stack) => [R.remove(0, 1, initialStack), initialStack[0]];

export const stackManip: State<Stack, undefined> = bind(pop, (x) => bind(push(x * x), () => bind(pop, (y) => push(x + y))));