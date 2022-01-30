export type State<S, A> = (initialState: S) => [S, A];

export const bind = <S, A, B>(state: State<S, A>, f: (x: A) => State<S, B>): State<S, B> => {
    return (initialState: S) => {
        const midState = state(initialState);
        const outputState = f(midState[1])(midState[0])
        return [outputState[0], outputState[1]];
    };
};