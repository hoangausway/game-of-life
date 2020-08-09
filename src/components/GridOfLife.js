import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const GridOfLife = ({ world, toggle }) => {
  const { arr, height, width } = world
  return (
    <StyledGrid height={height} width={width}>
      {arr.map((v, i) => {
        const y = Math.floor(i / width)
        const x = i - y * width
        return (
          <StyledCell
            key={i}
            data-x={x}
            data-y={y}
            islive={v}
            onClick={toggle}
          />
        )
      })}
    </StyledGrid>
  )
}

GridOfLife.propTypes = {
  world: PropTypes.objectOf(
    PropTypes.array,
    PropTypes.number,
    PropTypes.number
  ),
  toggle: PropTypes.func
}

export default GridOfLife

/*
  Helpers - Styled Components
*/
const StyledGrid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-gap: 0px;
  grid-template-columns: ${props => `repeat(${props.width}, 1fr)`};
  grid-template-rows: ${props => `repeat(${props.height}, 1fr)`};
  border: 1px solid #fafafa;
`

const StyledCell = styled.div`
  background-color: ${props => (props.islive ? 'navy' : 'white')};
  border: 1px solid #f0f0f0;
`
