import React, { useState } from 'react'

import { drawPattern, lifeCount } from './rulesOfLife'
import { patterns } from './patterns' /* pre-defined GOL patterns */
import useEventOfLife from './useEventOfLife'
import GridOfLife from './GridOfLife'
import GOLControlPanel from './GOLControlPanel'

// const initialWorld = drawPattern(HEIGHT, WIDTH, pattern)
const makePattern = (patternName, originX, originY) => ({
  matrix: patterns[patternName],
  originX,
  originY
})
const makeResetEvent = (tick, pattern) => ({
  world_event_reset: { pattern, tick }
})

const Gol = ({
  height,
  width,
  initialPatternName,
  initialOriginX,
  initialOriginY,
  initialTick
}) => {
  const initialPattern = makePattern(
    initialPatternName,
    initialOriginX,
    initialOriginY
  )
  const initialResetEvent = makeResetEvent(initialTick, initialPattern)
  const initialWorld = drawPattern(height, width, initialPattern)

  // states: world, lives count
  const [world, setWorld] = useState(initialWorld)
  const [count, setCount] = useState(lifeCount(initialWorld.arr))

  // observers which will update states
  const worldObserver = setWorld
  const pauseObserver = paused => console.log(`Is paused? ${!paused}`)
  const countObserver = setCount
  const resetObserver = e => console.log('RESET')

  /*
    wrapper of business logics of the game of life
    return a set of handlers/emitter which can be used to raise/trigger events
    from inside the wrapper, the observers will be called as events happen
  */
  const [resetEmit, pauseEmit, toggleEmit] = useEventOfLife(
    [worldObserver, pauseObserver, countObserver, resetObserver],
    initialWorld,
    initialResetEvent
  )

  return (
    <div>
      <GOLControlPanel
        resetEmit={resetEmit}
        pauseEmit={pauseEmit}
        patterns={patterns}
        options={[
          initialTick,
          initialPatternName,
          initialOriginX,
          initialOriginY
        ]}
      />
      <label>{'Lives: ' + count}</label>
      <div style={style}>
        <GridOfLife world={world} toggle={toggleEmit} />
      </div>
    </div>
  )
}
export default Gol

const style = {
  width: '600px',
  height: '600px',
  border: '1px solid navy',
  margin: '0.5em',
  padding: '3px'
}
