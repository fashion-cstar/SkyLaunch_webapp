import { ButtonPrimary, ButtonSecondary } from '../../components/Button'

import { NavLink } from 'react-router-dom'
import React from 'react'
import styled from 'styled-components'

const moment = require('moment');
const StyledNavLink = styled(NavLink)`
  text-decoration: none
`

const RowContainer = styled.div`
  background: #1c1c1c;
  padding: 0 16px 16px;
  margin-bottom: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  min-height: 120px;
  position: relative;

  ::after {
    border: 2px solid #9485DA;
    content: '';
    width: calc(100% - 200px);
    position: absolute;
    bottom: 0;
    left: 160px;
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
  max-width: 160px;
  margin-left: 20px;
  img {
    max-height: 120px;
    max-width: 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 1rem;
    margin-top: 1rem;
  `};
`
const InfoSection = styled.div<{ width?: any }>`
  width: 130px;
  height: 80px;
  padding-left: 10px;
  padding-right: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  ${({ width }) => width && `width: ${width}px`};
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
      <InfoSection>
        <StyledNavLink id={`${idoInfo.idoURL}-nav-link`} to={`/launchpad/${idoInfo.idoURL}`}>
          <ButtonPrimary style={{ width: '120px', padding: '5px 0', textTransform: 'uppercase' }}>Details</ButtonPrimary>
        </StyledNavLink>
      </InfoSection>
      <LogoWrapper>
        <img src={idoInfo.logo} />
      </LogoWrapper>
      <InfoSection className="mobile-hidden">
        {idoInfo.tierName}
      </InfoSection>
      <InfoSection className="mobile-hidden">
        {moment(idoInfo.launchDate).fromNow()}
      </InfoSection>
      <InfoSection className="mobile-hidden">
        {idoInfo.totalRaise}
      </InfoSection>
      <InfoSection className="mobile-hidden">
        {idoInfo.totalAmount}
      </InfoSection>
      <InfoSection className="mobile-hidden">
        {idoInfo.allocationMin}
      </InfoSection>
      <InfoSection className="mobile-hidden">
        {idoInfo.allocationMax}
      </InfoSection>
    </RowContainer>
  )
}
