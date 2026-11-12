import { createStore as createZustandStore, useStore, type StateCreator, type StoreMutatorIdentifier } from 'zustand';

export const createStore =
  <State>() =>
  <Mutators extends [StoreMutatorIdentifier, unknown][] = []>(initializer: StateCreator<State, [], Mutators>) => {
    const store = createZustandStore<State>()(initializer);

    function use(): State;
    function use<Selected>(selector: (state: State) => Selected): Selected;
    function use<Selected>(selector?: (state: State) => Selected) {
      return useStore(store, selector ?? ((state) => state as unknown as Selected));
    }

    return Object.assign(store, { use });
  };
