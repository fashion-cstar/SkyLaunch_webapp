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
const FundedAmountPanel = ({ multiplier, fundingAmount, symbol }: { multiplier?: number, fundingAmount?: number, symbol?: string }) => {
   
    return (
        <>
            <Container>
                <HypotheticalRewardRate dim={multiplier?false:true}>
                    <div>
                    <TYPE.black fontWeight={600}>Multiplier</TYPE.black>
                    </div>

                    <TYPE.black>
                    {multiplier}
                    </TYPE.black>
                </HypotheticalRewardRate>   
                <HypotheticalRewardRate dim={fundingAmount?false:true}>
                    <div>
                    <TYPE.black fontWeight={600}>Funded Amount</TYPE.black>
                    </div>

                    <TYPE.black>
                    {fundingAmount}{' '}{symbol}
                    </TYPE.black>
                </HypotheticalRewardRate>    
            </Container>
        </>
    )
}

export default memo(FundedAmountPanel)