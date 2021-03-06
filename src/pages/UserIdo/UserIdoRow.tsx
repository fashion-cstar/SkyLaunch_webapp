import { ButtonPrimary, ButtonSecondary, ButtonIdoNotingtoClaim } from '../../components/Button'

import { NavLink } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import formatEther from 'utils/formatEther'
import ClaimModal from '../Launchpad/components/ClaimModal'
import { useActiveWeb3React } from '../../hooks'
import { usePoolAndUserInfoCallback, useFundAndRewardTokenCallback, useTotalRewards, usePendingRewards } from 'state/fundraising/hooks'
import { PoolInfo, UserInfo } from 'state/fundraising/actions'
import { Token } from '@skylaunch/sdk'
import { useWalletModalToggle } from 'state/application/hooks'

const RowContainer = styled.div`
  display: flex;  
  justify-content: start;
  align-items: center;
  background: #1c1c1c;  
  overflow: hidden;
  min-height: 120px;  
  position: relative;  
  ::after {
    border: 2px solid #9485DA;
    content: '';
    width: calc(100% - 200px);
    position: absolute;
    bottom: 0;
    left: 180px;
    right: 0;
  }

  :last-child {
    ::after {
      border: 0 !important;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;

    ::after {
      border: 0 !important;
    }
  `};
`

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 140px;  
  width: 140px;
  padding: 0px 10px 0px 15px;  
  img {    
    max-height: 120px;
    width: 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 1rem;
    margin-top: 1rem;
  `};
`
const ButtonSection = styled.div`
  min-width: 160px; 
  width: 160px;
  padding: 5px; 
  display: flex;  
  align-items: center;  
  justify-content: center;  
  ${({ theme }) => theme.mediaWidth.upToMedium`
    &.mobile-hidden {
      display: none;
    }
    margin-bottom: 1rem;
    margin-top: 1rem;
  `};
`
const TableContainer = styled.div`
  width: 100%;  
  display: flex;
  justify-content: space-between;
`
const InfoSection = styled.div<{ width?: any }>`
  width: ${({ width }) => (width ? width + '%' : '16%')};
  height: 60px;  
  display: flex;  
  justify-content: center;
  align-items: center;    
  ${({ theme }) => theme.mediaWidth.upToMedium`
    &.mobile-hidden {
      display: none;
    }
    margin-bottom: 1rem;
    margin-top: 1rem;
  `};
`
export default function UserIdoRow({ logo, network, pid }: { logo: string, network: number, pid: number }) {
  const { library, account, chainId } = useActiveWeb3React()
  const [totalTokens, setTotalTokens] = useState<BigNumber>(BigNumber.from(0))
  const [claimedTokens, setClaimedTokens] = useState<BigNumber>(BigNumber.from(0))
  const [leftTokens, setLeftTokens] = useState<BigNumber>(BigNumber.from(0))
  const [amountToClaim, setAmountToClaim] = useState<BigNumber>(BigNumber.from(0))
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [countsOfPool, setCountsOfPool] = useState(0)
  const [poolInfoData, setPoolInfoData] = useState<PoolInfo | undefined>()
  const [userInfoData, setUserInfoData] = useState<UserInfo | undefined>()
  const [rewardToken, setRewardToken] = useState<Token | undefined>()
  const [fundToken, setFundToken] = useState<Token | undefined>()
  const [userIdoType, setUserIdoType] = useState(0)
  const [cliffEndTime, setCliffEndTime] = useState('')
  const userTotalRewards = useTotalRewards(pid)
  const userPendingRewards = usePendingRewards(pid)
  const { poolInfoCallback, userInfoCallback, countsOfPoolCallback } = usePoolAndUserInfoCallback()
  const { fundTokenCallback, rewardTokenCallback } = useFundAndRewardTokenCallback(account)
  const toggleWalletModal = useWalletModalToggle()

  useEffect(() => {
    if (account) {
      countsOfPoolCallback().then(res => {
        setCountsOfPool(res)
      }).catch(error => { setCountsOfPool(0) })
    } else {
      setCountsOfPool(0)
    }
  }, [account])

  useEffect(() => {
    if (pid >= 0 && pid < countsOfPool) {
      poolInfoCallback(pid)
        .then(poolInfo => {
          if (poolInfo) setPoolInfoData(poolInfo)
          else setPoolInfoData(undefined)
        })
        .catch(error => {
          setPoolInfoData(undefined)
        })
    }
  }, [poolInfoCallback, pid, countsOfPool, account])

  const readUserInfoData = () => {
    userInfoCallback(pid)
      .then(userInfo => {
        if (userInfo) setUserInfoData(userInfo)
        else setUserInfoData(undefined)
      })
      .catch(error => {
        setUserInfoData(undefined)
      })
  }

  useEffect(() => {
    if (pid >= 0 && pid < countsOfPool && account) {
      readUserInfoData()
    }
  }, [userInfoCallback, pid, countsOfPool, account])

  useEffect(() => {
    if (poolInfoData) {
      fundTokenCallback(poolInfoData.fundRaisingToken).then(fundToken => {
        if (fundToken) setFundToken(fundToken)
      }).catch(error => {
        setFundToken(undefined)
      })
      rewardTokenCallback(poolInfoData.rewardToken).then(rewardToken => {
        if (rewardToken) setRewardToken(rewardToken)
      }).catch(error => {
        setRewardToken(undefined)
      })
    }
  }, [poolInfoData])

  useEffect(() => {
    setAmountToClaim(userPendingRewards)
  }, [userPendingRewards])

  useEffect(() => {
    if (totalTokens.gt(0)) {      
      let left=totalTokens.sub(amountToClaim).sub(claimedTokens)
      setLeftTokens(left)
    }
  }, [totalTokens, claimedTokens, amountToClaim])

  useEffect(() => {
    if (network === chainId) {
      if (userInfoData && poolInfoData && rewardToken) {
        if (userInfoData?.fundingAmount.gt(0)) {
          if (poolInfoData?.rewardsCliffEndTime.gt(0)) {
            setCliffEndTime((new Date(poolInfoData?.rewardsCliffEndTime.toNumber() * 1000)).toLocaleString('en-GB', { timeZone: 'UTC' }))
          }
          if (poolInfoData?.rewardsStartTime.gt(0) && poolInfoData?.rewardsCliffEndTime.lte(BigNumber.from(Math.floor(Date.now() / 1000)))) {
            if (userTotalRewards.gt(0)) {
              setTotalTokens(userTotalRewards)
            }
            setClaimedTokens(userInfoData.collectedRewards)
            setUserIdoType(1) //claim
          } else {
            setUserIdoType(2)
            if (userTotalRewards.gt(0)) {
              setTotalTokens(userTotalRewards)
              setLeftTokens(userTotalRewards)
            }
            setClaimedTokens(BigNumber.from(0))
            setAmountToClaim(BigNumber.from(0))
          }
        }
      } else {
        setUserIdoType(0)
        setTotalTokens(BigNumber.from(0))
        setClaimedTokens(BigNumber.from(0))
        setLeftTokens(BigNumber.from(0))
        setAmountToClaim(BigNumber.from(0))
      }
    } else {
      setUserIdoType(3)
    }
  }, [userInfoData, poolInfoData, userTotalRewards, rewardToken])

  const resetCollectedRewards = () => {
    readUserInfoData()
  }

  const openClaimModal = async () => {
    if (rewardToken) {
      try {
        setShowClaimModal(!showClaimModal)
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <>
      {userIdoType > 0 && <RowContainer>
        {poolInfoData && userInfoData && (<ClaimModal resetCollectedRewards={resetCollectedRewards}
          isOpen={showClaimModal} onDismiss={() => setShowClaimModal(false)}
          pid={pid} userInfoData={userInfoData} rewardToken={rewardToken}
          fundToken={fundToken} />)}
        <ButtonSection>
          {userIdoType === 1 ? (<ButtonPrimary style={{ width: '150px', fontSize: "14px", padding: "0px 5px", height: '30px', textTransform: 'uppercase' }} onClick={openClaimModal} disabled={!userPendingRewards.gt(0)}>{userPendingRewards.gt(0) ? 'Claim' : 'Claimed'}</ButtonPrimary>) :
            userIdoType === 2 ? (<ButtonIdoNotingtoClaim style={{ width: '150px', fontSize: "14px", padding: "0px 5px", height: '30px', textTransform: 'uppercase' }} disabled>Nothing to Claim</ButtonIdoNotingtoClaim>) :
              (<ButtonSecondary style={{ width: '150px', fontSize: "14px", padding: "0px 5px", height: '30px', textTransform: 'uppercase' }} onClick={toggleWalletModal}>Change Network</ButtonSecondary>)
          }
        </ButtonSection>
        <LogoWrapper>
          <img src={logo} />
        </LogoWrapper>
        <TableContainer>
          <InfoSection className="mobile-hidden" width={20}>
            <div style={{ textAlign: 'center' }}>{totalTokens.gt(0) && rewardToken ? formatEther(totalTokens, rewardToken.decimals, 2, true) : '--'}</div>
          </InfoSection>
          <InfoSection className="mobile-hidden" width={20}>
            <div style={{ textAlign: 'center' }}>{claimedTokens.gt(0) && rewardToken ? formatEther(claimedTokens, rewardToken.decimals, 2, true) : '--'}</div>
          </InfoSection>
          <InfoSection className="mobile-hidden" width={20}>
            <div style={{ textAlign: 'center' }}>{leftTokens.gt(0) && rewardToken ? formatEther(leftTokens, rewardToken.decimals, 2, true) : '--'}</div>
          </InfoSection>
          <InfoSection className="mobile-hidden" width={20}>
            <div style={{ textAlign: 'center' }}>{amountToClaim.gt(0) && rewardToken ? formatEther(amountToClaim, rewardToken.decimals, 2, true) : '--'}</div>
          </InfoSection>
          <InfoSection className="mobile-hidden" width={20}>
            <div style={{ textAlign: 'center', fontSize: '14px' }}>{cliffEndTime}</div>
          </InfoSection>
        </TableContainer>
      </RowContainer>}
    </>
  )
}
