import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import PageContainer from './../../components/PageContainer'
import { PageHeader, Title } from '../../theme'

import { StakingControls, StakingHeader, StakingCard } from './../../components/staking'
import StakingModal from 'components/pools/StakingModal'
import { useStakingInfo } from '../../state/stake/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useTokenBalance } from 'state/wallet/hooks'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import { getAllPoolsAPY } from 'api'

import {
  AprObjectProps,
  setAprData,
  setPoolsData,
  setStackingInfo,
  setToggle,
  setPoolEarnings
} from './../../state/pools/actions'

const WrapStakingCard = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;  
`

const WrapContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
  margin-bottom: 1rem;
  background: #1C1C1C;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;
`

const Staking = () => {
  const { account, chainId } = useActiveWeb3React()
  const baseStakingInfo = useStakingInfo(undefined)

  const dispatch = useDispatch<AppDispatch>()

  const [showClaimRewardModal, setShowClaimRewardModal] = useState<boolean>(false)
  const [claimRewardStaking, setClaimRewardStaking] = useState<any>(null)

  const [apyRequested, setApyRequested] = useState(false)

  // loop through eachs taking contract and collect more info
  console.log(baseStakingInfo[0]);

  // const getAllAPY = async () => {
  //   const res = await getAllPoolsAPY()
  //   setApyRequested(true)
  //   if (!res.hasError) {
  //     dispatch(setAprData({ aprData: res?.data }))
  //     setApyRequested(false)
  //   }
  // }

  // let arrayToShow: any[] = []

  // const setArrayToShow = async () => {
  //   !aprData.length && (await getAllAPY())
  //   //  APR
  //   if (aprData && aprData.length) {
  //     stakingInfos.forEach(arrItem => {
  //       aprData.forEach((dataItem: AprObjectProps) => {
  //         if (dataItem?.contract_addr === arrItem.stakingRewardAddress && !arrItem['APR']) {
  //           arrItem['APR'] = dataItem.APY
  //         }
  //       })
  //     })
  //   }
  // }

  // setArrayToShow()

  console.log(baseStakingInfo)
  const stakingInfo = baseStakingInfo[0];
  console.log(stakingInfo);

  const handleHarvest = (stakingInfo: any) => {
    setClaimRewardStaking(stakingInfo)
    setShowClaimRewardModal(true)
  }


  return (
    <>
      <PageHeader>
        <Title>Staking</Title>
      </PageHeader>
      <PageContainer>
        <WrapContainer>
          <StakingHeader />
          { /*<StakingControls /> */ }
          <WrapStakingCard>
            {baseStakingInfo.map(stakingInfo => {
              return <StakingCard stakingInfoTop={stakingInfo} account={account} chainId={chainId} />
            })}
          </WrapStakingCard>
        </WrapContainer>
      </PageContainer>
    </>
  )
}

export default Staking
