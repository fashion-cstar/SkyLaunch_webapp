import { ButtonPrimary, ButtonSecondary } from '../../components/Button'

import { NavLink } from 'react-router-dom'
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import styled from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import toEtherAmount from 'utils/toEtherAmount'
import ClaimModal from '../Launchpad/components/ClaimModal'
import { useActiveWeb3React } from '../../hooks'
import { useClaimCallback } from 'state/fundraising/hooks'
import { useWalletModalToggle } from 'state/application/hooks'
const moment = require('moment');
const StyledNavLink = styled(NavLink)`
  text-decoration: none
`

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
export default function UserIdoRow({ idoInfo, idoIndex}: { idoInfo: any, idoIndex: number }) {
  const { library, account, chainId } = useActiveWeb3React()
  const [totalTokens, setTotalTokens] = useState(0)
  const [claimedTokens, setClaimedTokens] = useState(0)
  const [leftTokens, setLeftTokens] = useState(0)
  const [amountToClaim, setAmountToClaim] = useState(0)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const { pendingCallback } = useClaimCallback(account)
  const [pendingAmount, setPendingAmount] = useState(0);
  const toggleWalletModal = useWalletModalToggle()
  useEffect(() => {
    setTotalTokens(idoInfo.totalTokens)
    setClaimedTokens(idoInfo.claimedTokens)
    setLeftTokens(idoInfo.leftTokens)
    setAmountToClaim(idoInfo.amountToClaim)
  }, [idoInfo])

  const resetCollectedRewards = (amount:BigNumber) => {         
    let left=Math.round((totalTokens-toEtherAmount(amount, idoInfo.rewardToken, 2))*100)/100    
    setClaimedTokens(toEtherAmount(amount, idoInfo.rewardToken, 2))
    setAmountToClaim(0)
    setLeftTokens(left)
  }

  const openClaimModal = async () => {    
    if (idoInfo.rewardToken){
      let pending=await pendingCallback(idoInfo.pid)    
      setPendingAmount(toEtherAmount(pending, idoInfo.rewardToken, 3))
      setShowClaimModal(!showClaimModal)
    }
  }

  return (
    <RowContainer>
      {idoInfo.poolInfoData && idoInfo.userInfoData && (<ClaimModal resetCollectedRewards={resetCollectedRewards}        
            isOpen={showClaimModal} account={account} onDismiss={() => setShowClaimModal(false)}
            pid={idoInfo.pid} pendingAmount={pendingAmount}
            userInfoData={idoInfo.userInfoData} rewardToken={idoInfo.rewardToken} fundToken={idoInfo.fundToken}/>)}
      <ButtonSection>        
          { idoInfo.type===1 ?(<ButtonPrimary style={{ width: '150px', fontSize:"14px", padding:"0px 5px", height:'30px', textTransform: 'uppercase' }} onClick={openClaimModal}>Claim</ButtonPrimary>):
            idoInfo.type===2 ?(<ButtonSecondary style={{ width: '150px', fontSize:"14px", padding:"0px 5px", height:'30px', textTransform: 'uppercase' }} disabled>Nothing to Claim</ButtonSecondary>):
            (<ButtonSecondary style={{ width: '150px', fontSize:"14px", padding:"0px 5px", height:'30px', textTransform: 'uppercase' }} onClick={toggleWalletModal}>Change Network</ButtonSecondary>)
          }        
      </ButtonSection>      
      <LogoWrapper>
        <img src={idoInfo.logo} />
      </LogoWrapper>
      <TableContainer>
        <InfoSection className="mobile-hidden" width={25}>
          <div style={{textAlign: 'center'}}>{totalTokens?totalTokens:'--'}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={25}>
          <div style={{textAlign: 'center'}}>{claimedTokens?claimedTokens:'--'}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={25}>
          <div style={{textAlign: 'center'}}>{leftTokens?leftTokens:'--'}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={25}>
          <div style={{textAlign: 'center'}}>{amountToClaim?amountToClaim:'--'}</div>
        </InfoSection>   
      </TableContainer>      
    </RowContainer>
  )
}
