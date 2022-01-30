/* 2.1 */

export const MISSING_KEY = '___MISSING___'

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}

export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    const database: Map<K, V> = new Map();
    return {
        get(key: K) {
            return new Promise<V>((resolve, reject) => {
                if (database.has(key)) {
                    const val: V | undefined = database.get(key);
                    switch (val) {
                        case undefined:
                            break;
                        default:
                            resolve(val);
                    }
                }
                else
                    reject(MISSING_KEY);
            });
        },
        set(key: K, value: V) {
            return new Promise<void>((resolve) => {
                database.set(key, value);
                resolve();
            });
        },
        delete(key: K) {
            return new Promise<void>((resolve, reject) => {
                if (database.has(key)) {
                    database.delete(key);
                    resolve();
                }
                else
                    reject(MISSING_KEY);
            });
        },
    }
}

export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> {
    return Promise.all(keys.map(store.get));
}

/* 2.2 */
export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
    const store: PromisedStore<T, R> = makePromisedStore<T, R>();
    return (
        async (param: T): Promise<R> => {
            try {
                return await store.get(param);
            } catch {
                await store.set(param, f(param));
                return await store.get(param);
            }
        }
    );
}

/* 2.3 */
export function lazyFilter<T>(genFn: () => Generator<T>, filterFn: (param: T) => boolean): () => Generator<T> {
    return function* newGen(): Generator<T> {
        for (let element of genFn()) {
            if (filterFn(element))
                yield element;
        }
    }
}

export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (param: T) => R): () => Generator<R> {
    return function* newGen(): Generator<R> {
        for (let element of genFn()) {
            yield mapFn(element);
        }
    }
}

/* 2.4 */
//you can use 'any' in this question

export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((param: any) => Promise<any>)[]]): Promise<any> {
    return fns.reduce(
        (async (lastParam: Promise<any>, currFn: (param: any) => Promise<any>) => {
            try {
                return runFn(await lastParam, currFn, 3, new Error)
            } catch (e) {
                throw e;
            }
        })
        , runFn({}, fns[0], 3, new Error))
}

async function runFn(param: any, fn: (res: any) => Promise<any>, reRuns: number, error: Error): Promise<any> {
    if (reRuns === 0) {
        throw error;
    }
    try {
        return await fn(param);
    } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return await runFn(param, fn, reRuns - 1, e);
    }
}