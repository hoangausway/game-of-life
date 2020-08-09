import React from 'react'
import { Subject, merge } from 'rxjs'
import { map, scan } from 'rxjs/operators'

import { of } from 'rxjs'
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators'

const GOLControlPanel = ({ resetEmit, pauseEmit, patterns, options }) => {
  const [
    initialTick,
    initialPatternName,
    initialOriginX,
    initialOriginy
  ] = options
  const initialState = {
    isPaused: false,
    patternName: initialPatternName,
    originX: initialOriginX,
    originY: initialOriginy,
    tick: initialTick,
    selectionNames: ''
  }

  const [state, setState] = React.useState(initialState)

  const stateObserver = state => setState(state)
  const [
    isPausedEmit,
    patternNameEmit,
    patterNameKeyUpEmit,
    originXEmit,
    originYEmit,
    tickEmit
  ] = useEventPanel(stateObserver, initialState, Object.keys(patterns).sort())

  const resetHandler = e => {
    const key = patterns.hasOwnProperty(state.patternName)
      ? state.patternName
      : 'EMPTY'
    const ev = {
      ...e,
      world_event_reset: {
        pattern: {
          matrix: patterns[key],
          originX: state.originX,
          originY: state.originY
        },
        tick: state.tick
      }
    }
    resetEmit(ev)
  }

  const pauseHandler = e => {
    isPausedEmit(e)
    pauseEmit(e)
  }

  return (
    <div>
      <button onClick={pauseHandler}>{state.isPaused ? '|>' : '||'}</button>
      <button onClick={resetHandler}>RESET</button>
      <section>
        <label>Pattern:</label>
        <input
          placeholder='pattern name'
          value={state.patternName}
          onChange={patternNameEmit}
          onKeyUp={patterNameKeyUpEmit}
        />
        <div
          style={{
            width: '600px',
            height: '28px',
            overflow: 'scroll',
            backgroundColor: 'palegreen'
          }}
        >
          {state.selectionNames}
        </div>
      </section>
      <section>
        <label>OriginX:</label>
        <input
          type='number'
          placeholder='X origin'
          value={state.originX}
          onChange={originXEmit}
        />
        <label>OriginY:</label>
        <input
          type='number'
          placeholder='Y origin'
          value={state.originY}
          onChange={originYEmit}
        />
      </section>
      <section>
        <label>Tick:</label>
        <input
          type='number'
          placeholder='X origin'
          value={state.tick}
          onChange={tickEmit}
        />
      </section>
    </div>
  )
}

export default GOLControlPanel

const getNames = chars => patternNameArray =>
  patternNameArray
    .filter(v => v.indexOf(chars.toUpperCase()) > -1)
    .sort()
    .join(' ')

const useEventPanel = (stateObserver, initialState, patternNameArray) => {
  // define events and related triggers
  const [isPausedEmit, isPausedEvent$] = useEvent()
  const [patternNameEmit, patternNameEvent$] = useEvent()
  const [patterNameKeyUpEmit, patterNameKeyUpEvent$] = useEvent()
  const [originXEmit, originXEvent$] = useEvent()
  const [originYEmit, originYEvent$] = useEvent()
  const [tickEmit, tickEvent$] = useEvent()

  const isPaused$ = isPausedEvent$.pipe(
    map(e => state => ({ ...state, isPaused: !state.isPaused }))
  )
  const patternName$ = patternNameEvent$.pipe(
    map(e => state => ({ ...state, patternName: e.target.value.toUpperCase() }))
  )
  const originX$ = originXEvent$.pipe(
    map(e => state => ({ ...state, originX: parseInt(e.target.value) }))
  )
  const originY$ = originYEvent$.pipe(
    map(e => state => ({ ...state, originY: parseInt(e.target.value) }))
  )
  const tick$ = tickEvent$.pipe(
    map(e => state => ({ ...state, tick: parseInt(e.target.value) }))
  )

  // type ahead for patternName
  const patterNameKeyUp$ = patterNameKeyUpEvent$.pipe(
    map(e => e.target.value),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap(chars => of(getNames(chars)(patternNameArray))),
    map(names => state => ({ ...state, selectionNames: names }))
  )

  /*
    values emitted by each stream above are functions f: old state => new state
    merge them then scan to make stream of state values: state ... state ...
  */
  const state$ = merge(
    isPaused$,
    patternName$,
    patterNameKeyUp$,
    originX$,
    originY$,
    tick$
  ).pipe(scan((state, f) => f(state), initialState))

  React.useEffect(() => {
    const stateSub = state$.subscribe(stateObserver)

    return () => {
      stateSub.unsubscribe()
    }
    // eslint-disable-next-line
  }, [])

  return [
    isPausedEmit,
    patternNameEmit,
    patterNameKeyUpEmit,
    originXEmit,
    originYEmit,
    tickEmit
  ]
}

const useEvent = (deps = []) => {
  // eslint-disable-next-line
  const eventStream$ = React.useMemo(() => new Subject(), deps)
  // eslint-disable-next-line
  const eventEmit = React.useCallback(e => eventStream$.next(e), deps)
  return [eventEmit, eventStream$]
}
