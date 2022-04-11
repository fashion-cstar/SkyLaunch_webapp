import { ButtonPrimary, ButtonSecondary } from '../../components/Button'

import { NavLink } from 'react-router-dom'
import React from 'react'
import styled from 'styled-components'

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
    background: linear-gradient(to right, #9384DC, #D49583);
    height: 2px;
    content: '';
    width: calc(100% - 160px);
    position: absolute;
    bottom: 0;
    left: 140px;
    right: 0;
  }

  :last-child {
    ::after {
      height: 0 !important;
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column;

    ::after {
      height: 0 !important;
    }
  `};
`

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 160px;  
  width: 160px;
  padding: 0px 0px 0px 20px;  
  img {    
    max-height: 120px;
    width: 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 0px; 
    margin-bottom: 1rem;
    margin-top: 1rem;
  `};
`
const ButtonSection = styled.div`
  min-width: 120px; 
  width: 120px;
  padding: 5px 2px; 
  display: flex;  
  align-items: center;  
  justify-content: start;  
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
    &.mobile-hidden {
      display: none;
    }
    margin-bottom: 1rem;
    // margin-top: 1rem;
  `};
`

const IdoButtonLogoContainer=styled.div`
  display: flex;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: column-reverse;
    align-items: center;
    justify-content: center;
`};
`
const TableContainer = styled.div`
  width: 100%;  
  display: flex;
  justify-content: space-between;
`
const InfoSection = styled.div<{ width?: number }>`
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
export default function IdoRow({ idoInfo, idoIndex}: { idoInfo: any, idoIndex: number }) {
  return (
    <RowContainer>
      <IdoButtonLogoContainer>
        <ButtonSection>
          <StyledNavLink id={`${idoInfo.idoURL}-nav-link`} to={`/launchpad/${idoInfo.idoURL}`}>
            <ButtonPrimary style={{ width: '100%', height:'30px', textTransform: 'uppercase' }}>Details</ButtonPrimary>
          </StyledNavLink>
        </ButtonSection>      
        <LogoWrapper>
          <img src={idoInfo.logo} />
        </LogoWrapper>
      </IdoButtonLogoContainer>
      <TableContainer>
        <InfoSection className="mobile-hidden" width={16}>
          <div style={{textAlign: 'center'}}>{idoInfo.tierName}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={17}>
          <div style={{textAlign: 'center'}}>{moment(idoInfo.launchDate).fromNow()}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={17}>
          <div style={{textAlign: 'center'}}>${idoInfo.targetRaise}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={16}>
          <div style={{textAlign: 'center'}}>{idoInfo.totalAmount}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={17}>
          <div style={{textAlign: 'center'}}>${idoInfo.IdoPrice}</div>
        </InfoSection>
        <InfoSection className="mobile-hidden" width={17}>
          <div style={{textAlign: 'center'}}>{idoInfo.allocationMax}</div>
        </InfoSection>
      </TableContainer>      
    </RowContainer>
  )
}
