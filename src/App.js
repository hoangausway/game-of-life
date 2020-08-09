import React from 'react'

import Gol from './components/GOL'

const HEIGHT = 40
const WIDTH = 40

const App = () => (
  <>
    <Gol
      height={HEIGHT}
      width={WIDTH}
      initialPatternName='ROTEIGHTOR'
      initialOriginX={5}
      initialOriginY={5}
      initialTick={1000}
    />
    <Gol
      height={HEIGHT}
      width={WIDTH}
      initialPatternName='ANTS'
      initialOriginX={0}
      initialOriginY={0}
      initialTick={500}
    />
  </>
)

export default App
