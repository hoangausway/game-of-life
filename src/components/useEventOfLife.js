import React from 'react'
import { Subject } from 'rxjs'
// eslint-disable-next-line
import { startWith, map, scan, tap } from 'rxjs/operators'

import { WorldEventTypes, makeWorldStream, lifeCount } from './rulesOfLife'

/*
INPUT
  observers:
  - worldObserver to observe combination of events: 'tick', 'toggle cell', and 'paused'
  - pauseObserver to observe event of 'paused' value
  - countObserver to observe event of 'number of live cells' value
  initialWorld: initial world state
  tick: time interval event
OUPUT
  handlers:
  - pauseEmit: triggers emitting of 'paused' event
  - toggleEmit: trigggers emitting of 'toggle cell' event
  - resetEmit: tigggers emitting of 'reset' event
*/
const useEventOfLife = (observers, initialWorld, initialResetEvent) => {
  const [worldObserver, pauseObserver, countObserver, resetObserver] = observers

  // define events and related triggers
  const [toggleEmit, toggleEvent$] = useEvent()
  const [pauseEmit, pauseEvent$] = useEvent()
  const [resetEmit, resetEvent$] = useEvent()

  // add events' types
  const reset$ = resetEvent$.pipe(
    map(e => ({
      ...e,
      world_event_type: WorldEventTypes.RESET,
      world_event_reset: e.world_event_reset
    })),
    startWith(initialResetEvent)
  )
  const toggle$ = toggleEvent$.pipe(
    map(e => ({
      ...e,
      world_event_type: WorldEventTypes.TOGGLE,
      world_event_cell: [
        parseInt(e.target.dataset.x),
        parseInt(e.target.dataset.y)
      ]
    }))
  )
  const pause$ = pauseEvent$.pipe(
    map(e => ({ ...e, world_event_type: WorldEventTypes.ACTIVATE }))
  )

  // make stream of events which change the world state
  const worldStream$ = makeWorldStream(initialWorld, toggle$, pause$, reset$)

  // transform pauseClick event which change pauseText state
  const pauseStream$ = pauseEvent$.pipe(scan((paused, event) => !paused, true))

  // live count event
  const countStream$ = worldStream$.pipe(map(world => lifeCount(world.arr)))

  React.useEffect(() => {
    const worldSub = worldStream$.subscribe(worldObserver)
    const pauseSub = pauseStream$.subscribe(pauseObserver)
    const countSub = countStream$.subscribe(countObserver)
    const resetSub = reset$.subscribe(resetObserver)

    return () => {
      worldSub.unsubscribe()
      pauseSub.unsubscribe()
      countSub.unsubscribe()
      resetSub.unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  return [resetEmit, pauseEmit, toggleEmit]
}

export default useEventOfLife

/*
  returns emmiter which is trgiggered by a DOM event
*/
const useEvent = (deps = []) => {
  // eslint-disable-next-line
  const eventStream$ = React.useMemo(() => new Subject(), deps)
  // eslint-disable-next-line
  const eventEmit = React.useCallback(e => eventStream$.next(e), deps)
  return [eventEmit, eventStream$]
}
