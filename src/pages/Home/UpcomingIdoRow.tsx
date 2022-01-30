import { ButtonPrimary, ButtonSecondary } from '../../components/Button'

import { NavLink } from 'react-router-dom'
import React from 'react'
import styled from 'styled-components'

const StyledNavLink = styled(NavLink)`
  text-decoration: none
`

const RowContainer = styled.div`  
  padding: 0 16px;   
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;  
  }
`
const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 130px;    
  img {    
    max-width: 100%;
  }  
`
const InfoSection = styled.div<{ width?: any }>`  
  padding: 20px 15px;   
`
export default function UpcomingIdoRow({ idoInfo, idoIndex}: { idoInfo: any, idoIndex: number }) {
  return (
    <RowContainer>
        <LogoWrapper>
            <img src={idoInfo.logo} />
        </LogoWrapper>
        <InfoSection>
            <StyledNavLink id={`${idoInfo.idoURL}-nav-link`} to={`/launchpad/${idoInfo.idoURL}`}>
            <ButtonPrimary style={{ width: '90px', height: '30px', textTransform: 'uppercase' }}>Details</ButtonPrimary>
            </StyledNavLink>
        </InfoSection>            
    </RowContainer>
  )
}
