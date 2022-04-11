import React, { useMemo } from 'react'
import styled from 'styled-components'
import QuestionHelper from './../QuestionHelper'
import { STAKING_REWARDS_INFO } from 'state/stake/hooks'
import { useActiveWeb3React } from 'hooks'
import { isAddress } from '../../utils'
import { useMultipleContractSingleData } from 'state/multicall/hooks'
import { abi } from 'constants/abis/StakingRewards.json'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from 'ethers'

const InfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: end;
  gap: 1rem;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    align-items: center;
  `};
`
const HeadingContent = styled.div`
  display: flex;
  align-items: center;
`
const Heading = styled.div`
  margin-top: 25px;
  font-size: 20px;
  font-weight: 500;
  text-transform: uppercase;
  color: #aaa;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 15px;
    font-size: 18px;
    text-align: center;
  `};
`

const Score = styled.h1`
  line-height: 1;
  font-size: 60px;
  font-weight: 700;
`

const QuestionWrap = styled.div`
  margin-top: 25px;  
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 15px;    
  `};
  display: flex;  
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

  const scores = useMultipleContractSingleData(addresses, new Interface(abi), 'getUserScore', accountArg)

  let totalScore = BigNumber.from('0');
  if (scores != undefined) {
    if (scores.length > 0)
      totalScore = scores.map((scoreState) => { return BigNumber.from(scoreState?.result?.[0] ?? 0) }).reduce((sum, current) => sum.add(current));
  }
  return (
    <InfoBlock>
      <HeadingContent>
        <Heading>Your Score</Heading>
        <QuestionWrap>
          <QuestionHelper
            text={`This is where you can see your current score. The more you stake and the longer you stake for, the higher score you'll get, the bigger allocations`}
          />
        </QuestionWrap>
      </HeadingContent>
      <Score>{totalScore.toNumber()}</Score>
    </InfoBlock >
  )
}

export default StakingInfoBlock
