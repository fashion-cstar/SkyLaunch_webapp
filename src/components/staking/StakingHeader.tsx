import React, { useState } from 'react'
import styled from 'styled-components'

import { StakingInfoBlock, StakingClaimModal } from './index'

const StakingHeaderStyled = styled.header`
  width: 100%;
  background: #1c1c1c;
  padding: 32px 64px;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  flex-wrap: wrap;  
  border-radius: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    padding: 22px 24px;
  `};
`

const WrapContent = styled.div`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    // text-align: center;
`};
`

const ScoreMineContent = styled.div`
  display: flex;
`

const Description = styled.p`
  font-size: 18px;
  color: #fff;
  text-transform: uppercase;
  font-weight: 400;
  line-height: 1.2;
  max-width: 400px;
  ${({ theme }) => theme.mediaWidth.upToSmall`    
    font-size: 16px;
`};
`

const ImgContent = styled.img`
  width: 80px;
  height: 80px;
  margin-top: 25px;
  margin-right: 20px;
`

const Heading = styled.div`
  margin-top: 25px;
  font-size: 20px;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 15px;
    font-size: 18px;
  `};
`

const StakingHeader = () => {
  const [openClaimModal, setOpenClaimModal] = useState<boolean>(false)
  return (
    <StakingHeaderStyled>
      <StakingClaimModal open={openClaimModal} setOpen={setOpenClaimModal} />
      <ScoreMineContent>
        <ImgContent src='./images/stake_key.png' />
        <WrapContent>
          <Heading>Score mining</Heading>
          <Description>
            Simply stake our tokens to build up your score in real time.
          </Description>
        </WrapContent>
      </ScoreMineContent>
      <StakingInfoBlock setOpen={setOpenClaimModal} />
    </StakingHeaderStyled>
  )
}

export default StakingHeader
