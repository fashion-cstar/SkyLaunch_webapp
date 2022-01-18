import React from 'react'
import styled from 'styled-components'

const CircleSmall = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: #a57da5;
  display: flex;
  justify-content: center;
  align-items: center;
`
const CircleMedium = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #c793c794;
  display: flex;
  justify-content: center;
  align-items: center;
`
const CircleLarge = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #c17ac12c;
  display: flex;
  justify-content: center;
  align-items: center;
`

const StepperCircleContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 35px;
  position: relative;
  z-index: 10;
`
export default function StepperCircle() {
  return (
    <>
      <StepperCircleContainer>
        <CircleLarge>
          <CircleMedium>
            <CircleSmall />
          </CircleMedium>
        </CircleLarge>
      </StepperCircleContainer>
    </>
  )
}