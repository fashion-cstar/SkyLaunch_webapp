import React, { useMemo } from 'react'
import styled from 'styled-components'

import BubbleBase from './../BubbleBase'
import Row from 'components/Row'
import QuestionHelper from './../QuestionHelper'
import { ButtonPrimary } from './../../components/Button'
import { useMulticallContract, useStakingContract } from 'hooks/useContract'
import { STAKING_REWARDS_INFO } from 'state/stake/hooks'
import { useActiveWeb3React } from 'hooks'
import { isAddress } from '../../utils'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { abi } from 'constants/abis/StakingRewards.json'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from 'ethers'
import { JSBI } from '@skylaunch/sdk'

const InfoBlock = styled.div`
  min-width: 240px;
  padding: 24px;
  position: relative;
  color: #a7b1f4;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  min-width: 0px;
  width: 100%;
`};
`

const Title = styled.h3`
  font-weight: 600;
  line-height: 1.5;
  font-size: 16px;
`
const Score = styled.h1`
  line-height: 1;
  font-size: 40px;
`

const Wrap = styled(Row)`
  align-items: center;
`

const QuestionWrap = styled.div`
  display: flex;
  margin-left: 12px;
`

const NumberWrap = styled(Wrap)`
  margin-top: 20px;
  justify-content: space-between;
`

const SmallNumber = styled.h5`
  color: white;
  margin-top: 7px;
`

const ClaimButton = styled(ButtonPrimary)`
  width: 75px;
  color: white;
  padding: 10px;
  border-radius: 12px;
`

interface StakingInfoBlockProps {
  setOpen: (open: boolean) => void
}

const StakingInfoBlock = ({ setOpen }: StakingInfoBlockProps) => {

  // get the score
  const { chainId, account } = useActiveWeb3React();
  const accountArg = useMemo(() => [account ?? undefined], [account])
  const stakingContracts = STAKING_REWARDS_INFO[chainId!];

  const addresses: string[] = useMemo(
    () =>
    stakingContracts
        ? stakingContracts!
          .map((contract) => { return isAddress(contract.stakingRewardAddress) })
          .filter((a): a is string => a !== false)
          .sort()
        : [],
    [stakingContracts]
  )
  console.log(addresses)
  const scores = useMultipleContractSingleData(addresses, new Interface(abi), 'getUserScore', accountArg)
  
  let totalScore = BigNumber.from('0');
  if(scores != undefined){
    if(scores.length > 0)
      totalScore = scores.map((scoreState) => { return BigNumber.from(scoreState?.result?.[0] ?? 0) }).reduce((sum, current) => sum.add(current));
  }
  return (
    <InfoBlock>
      <BubbleBase />

      <Wrap>
        <Title>Your Score</Title>
        <QuestionWrap>
          <QuestionHelper
            text={`This is where you can see your current score. The more you stake and the longer you stake for, the higher score you'll get, the bigger allocations`}
          />
        </QuestionWrap>
      </Wrap>
      <NumberWrap>
        <div>
          <Score>{totalScore.toNumber()}</Score>
          <SmallNumber></SmallNumber>
        </div>
        {/* <ClaimButton onClick={() => setOpen(true)}>Claim</ClaimButton> */}
      </NumberWrap>
    </InfoBlock>
  )
}

export default StakingInfoBlock
