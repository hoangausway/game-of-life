# The Conway's Game Of Life using React and RxJS - `<game-of-life>`

## Subjects

- React, RxJS
- Build Conway's Game Of Life  with React and RxJS

## To show
- Taste Functional Reactive Programming (RxJS) with React

For the `web component` version please see:
- [The Conway's Game Of Life using Atomico and RxJS - <game-of-life>](https://github.com/hoangausway/atomico-game-of-life)


## Source - Build - Run

- The project structure is based on the **create-react-app**.
- Commands to install, build, watch and run:

```bash
npm install # install dependencies
npm start # build and watch for code changes and open the localserver: 3000
```

## Component's logics
**`game-of-life`**

**Quick description**

- Grid of "alive" and "dead" cells
- In each iteration of the game (a "tick"), cells become dead or alive based on the previous state of the neighbourhood:
  - **underpopulation:** any live cell with < 2 live neighbours dies
  - **overpopulation:** any live cell with > 3 live neighbours dies
  - **reproduction:** any dead cell with exactly 3 live neighbours becomes a live cell

**Links**

The description of Conway's Game Of Life: [https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life]

A good source introducing Reactive Programming/RxJs/Game Of Life: [https://docs.google.com/presentation/d/e/2PACX-1vQ06TaoEe3o9Xu7FluNigjqaKwXreoPj4xYgZ-ZCAw4cXlMSPpEqAH0re11eP2_uzw7N_hpEZ33gWsG/pub?start=false&loop=false&delayms=3000&slide=id.g34fa86e976_0_0]

## Takeaways
**How RxJS works with React**

**Engage DOM event with RxJS stream using React's useMemo/useCallback**
```bash
/src/components/game-of-life/useEventStream.js

import { useMemo, useCallback } from 'react'
import { Subject } from 'rxjs'

export const useEventStream = () => {
  const eventStream$ = useMemo(() => new Subject(), [])
  const eventEmit = useCallback(e => eventStream$.next(e), [])
  return [eventEmit, eventStream$]
}
```

Usage of useEventStream:

```bash
/src/components/game-of-life/useEventOfLife.js
import { useEventStream } from './useEventStream'
import { map } from 'rxjs/operators'
...
# define event streams and related triggers
const [toggleEmit, toggleEvent$] = useEventStream()
const [activeEmit, activeEvent$] = useEventStream()
const [resetEmit, resetEvent$] = useEventStream()
...
# manipulating pauseEvent$ stream
const active$ = activeEvent$.pipe(
  map(e => ({ ...e, world_event_type: WorldEventTypes.ACTIVATE }))
)

...
```
**Emit stream within useEffect**
```bash
/src/components/game-of-life/game-of-life.js
import { useEffect } from 'react'
...
# emits `active_toggle` event using `activeEmit`
useEffect(
  () => {
    activeEmit(new window.CustomEvent('active_toggle'))
  },
  [active]
)
```
**Subscribe/unsubscribe stream within useEffect**
```bash
/src/components/game-of-life/useEventOfLife.js
import { useEffect } from 'react'
...
useEffect(() => {
  ...
  const activeSub = activeStream$.subscribe(activeObserver)
  return () => {
    ...
    activeSub.unsubscribe()
  }
}, [])
```


## What's next
Improve `<game-of-life>` from some aspects.  It's nice to add a "control panel", which allows user to change  tick's duration, to apply initial world pattern from predefined list of famous patterns.

Or, we could accumulate some interesting statistic data (for example, max/min number of life cells).