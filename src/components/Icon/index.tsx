import Icons from './Icons'
import React from 'react'
import styled from 'styled-components'

const StyledSpan = styled.span`
  width: 20px;
  height: 20px;
`
export interface IconProps {
  icon: string
  active?: boolean
  color?: string
}

const Icon = ({ icon, active = false, color  }: IconProps) => {
  const IconPath = Icons[icon]
  return (
    <StyledSpan>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <IconPath color={color ? color : active ? '#7BE495' : 'white'} />
      </svg>
    </StyledSpan>
  )
}

export default Icon
