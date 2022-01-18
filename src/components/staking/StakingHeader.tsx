import React, { useState } from 'react'
import styled from 'styled-components'

import { StakingInfoBlock, StakingClaimModal } from './index'

const StakingHeaderStyled = styled.header`
  width: 100%;
  // margin: 20px 0;
  background: #1c1c1c;
  padding: 32px 64px;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  flex-wrap: wrap;  
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    padding: 22px 24px;
  `};
`

const WrapContent = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
`};
`

const Title = styled.h2`
  font-size: 34px;
`
const Description = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: #a7b1f4;
`
const StakingHeader = () => {
  const [openClaimModal, setOpenClaimModal] = useState<boolean>(false)
  return (
    <StakingHeaderStyled>
      <StakingClaimModal open={openClaimModal} setOpen={setOpenClaimModal} />
      <WrapContent>
        <Title>Score mining...</Title>
        <Description>
          Simply stake our tokens to build up your score in real time...
        </Description>
      </WrapContent>
      <StakingInfoBlock setOpen={setOpenClaimModal} />
    </StakingHeaderStyled>
  )
}

export default StakingHeader
