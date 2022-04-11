import React, { memo } from 'react'
import styled from 'styled-components'
import { TYPE } from '../../../theme'

const Container = styled.div`
    padding: 15px 0px;
    `
const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
    display: flex;
    justify-content: space-between;
    padding-right: 20px;
    padding-left: 20px;
    opacity: ${({ dim }) => (dim ? 0.5 : 1)};
  `
  const Text = styled.h3`
  color: #a7b1f4;
  font-weight: 500;
  1font-size: 14px;
`

const UserInfoPanel = ({ multiplier, fundingAmount, collectedRewards, fundTokenSymbol, rewardTokenSymbol, progressPhase }: 
    { multiplier?: number, fundingAmount?: string | undefined, collectedRewards?:string | undefined, fundTokenSymbol?: string, rewardTokenSymbol?: string, progressPhase:number }) => {
   
    return (
        <>
            <Container>
                {(progressPhase<4) && (<HypotheticalRewardRate dim={multiplier?false:true}>
                    <div>
                    <TYPE.black fontWeight={500} fontSize={'14px'}>Multiplier</TYPE.black>
                    </div>

                    <TYPE.black fontSize={'14px'}>
                    {multiplier}
                    </TYPE.black>
                </HypotheticalRewardRate>)}
                <HypotheticalRewardRate dim={fundingAmount?false:true}>
                    <div>
                    <TYPE.black fontWeight={500} fontSize={'14px'}>Funded Amount</TYPE.black>
                    </div>

                    <TYPE.black fontSize={'14px'}>
                    {fundingAmount}{' '}{fundTokenSymbol}
                    </TYPE.black>
                </HypotheticalRewardRate>
                {(progressPhase>=4) && (<HypotheticalRewardRate dim={collectedRewards?false:true}>
                    <div>
                    <TYPE.black fontWeight={500} fontSize={'14px'}>Collected Rewards</TYPE.black>
                    </div>

                    <TYPE.black fontSize={'14px'}>
                    {collectedRewards}{' '}{rewardTokenSymbol}
                    </TYPE.black>
                </HypotheticalRewardRate>)}
            </Container>
        </>
    )
}

export default memo(UserInfoPanel)