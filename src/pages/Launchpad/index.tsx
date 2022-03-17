import { Button as RebassButton } from 'rebass/styled-components'
import React, { useMemo, useState, useCallback } from 'react'

import { ExternalLink, Title, PageHeader } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import IdoRow from '../../components/ZeroGravity/IdoRow'
import PageContainer from '../../components/PageContainer'
import MenuTabs from '../../components/MenuTabs'
import styled from 'styled-components'
import moment from 'moment'
import { useHistory } from 'react-router'
import { useActiveWeb3React } from '../../hooks'
import { darken, lighten } from 'polished'
import { useIsFormSent, useIsKYCed } from 'state/fundraising/hooks'

const HeaderContainer = styled.div`  
  width: 100%;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
  `};
`

const HeaderButton = styled.div`
  padding: 5px 20px;
  border-radius: 50px;
  background: linear-gradient(to right, #79E295, #349F9C);
  color: #000;
  font-weight: 600;
  cursor: pointer;
`

const StyledExternalLink = styled(ExternalLink)`
  text-decoration: none !important;
  // margin-left: auto;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    // margin-right: auto;
  `};
`

const StyledButtonsWrap = styled.div`  
  display: flex;
  justify-content: end;  
  column-gap: 30px;
  ${({ theme }) => theme.mediaWidth.upToMedium`    
    justify-content: center;  
  `};
`

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding: 30px 20px 0px 20px;  
  background: #1C1C1C;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;
`
const HeadersWrap = styled.div`
  display: flex;
  flex-direction: row;  
  justify-content: start;
  align-items: center;    
  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: none;
  `};
`
const HeaderSection = styled.div<{ width?: number }>`
  width: ${({ width }) => (width ? width + '%' : '16%')}
  width: 16%;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 0.8rem;  
  text-transform: uppercase;
  text-align: center;  
`
const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;  
`

const Base = styled(RebassButton) <{
  padding?: string
  width?: string
  borderRadius?: string
  altDisabledStyle?: boolean
  textTransform?: string
}>`
  padding: ${({ padding }) => (padding ? padding : '12px 24px')};
  width: ${({ width }) => (width ? width : '100%')};
  text-transform: ${({ textTransform }) => (textTransform ? textTransform : textTransform)};
  font-weight: 500;
  text-align: center;
  border-radius: ${({ borderRadius }) => borderRadius ? borderRadius : '44px'};
  outline: none;
  border: 1px solid transparent;
  color: white;
  text-decoration: none;
  display: flex;
  justify-content: center;
  flex-wrap: nowrap;
  align-items: center;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: all .2s ease-in-out;
  &:disabled {
    cursor: auto;
  }

  > * {
    user-select: none;
  }
`

const ButtonRegister = styled(Base) <{ isPointer?: boolean, isKYCed?: boolean }>`
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  color: #000;
  font-size: 16px;
  font-weight: 600;
  display: ${({ isKYCed }) => (isKYCed ? 'none' : 'block')};
  text-transform: uppercase;
  background: linear-gradient(to right, #79E295, #349F9C);
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  &:focus {
    opacity: 0.8;
  }
  &:focus {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.05, theme.primary1)};
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.primary1)};
  }
  &:active {
    box-shadow: 0 0 0 1pt ${({ theme }) => darken(0.1, theme.primary1)};
    background-color: ${({ theme }) => darken(0.1, theme.primary1)};
  }
  &:disabled {
    background-color: ${({ theme, altDisabledStyle }) => (altDisabledStyle ? theme.primary1 : darken(3, theme.primary1))};
    color: ${({ theme }) => theme.text1};
    cursor: ${({ isPointer }) => (isPointer ? 'pointer' : 'auto')};
    box-shadow: none;
    border: 1px solid transparent;
    outline: none;
    opacity: ${({ altDisabledStyle }) => (altDisabledStyle ? '0.7' : '.7')};
  }
`

export default function ZeroGravityList() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const history = useHistory()
  const IsFormSent = useIsFormSent()
  const isKYCed = useIsKYCed()
  const IdoListFiltered = IDO_LIST // fetch this list from the server  

  const onHandleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }
  
  const handleRegisterClick = useCallback(() => history.push('/launchpad/kyc'), [history]);

  const tabs = [
    {
      name: 'Upcoming',
      value: 'upcoming'
    },
    {
      name: 'Live',
      value: 'live'
    },
    {
      name: 'Finished',
      value: 'finished'
    }
  ]

  return (
    <>
      <PageHeader>
        <Title>Launchpad</Title>
        <StyledButtonsWrap>
          <StyledExternalLink href="https://skylaunch.finance/wp-content/uploads/2022/01/SkyLaunch-application-form.docx" target='_blank'>
            <HeaderButton className="launch-button green">Launch My Token</HeaderButton>
          </StyledExternalLink>          
          <ButtonRegister isKYCed={isKYCed} width="120px" padding="5px 20px" onClick={handleRegisterClick} disabled={IsFormSent}>{IsFormSent ? 'In Progress' : 'Register'}</ButtonRegister>
        </StyledButtonsWrap>
        <HeaderContainer>
          <MenuTabs
            tabs={tabs}
            active={activeTab}
            onChange={onHandleChangeTab}
          />
        </HeaderContainer>
      </PageHeader>
      <PageContainer>
        <ListContainer>
          <HeadersWrap>
            <div style={{ minWidth: '110px', width: '110px', height: '20px' }}></div>
            <div style={{ minWidth: '160px', width: '160px' }}></div>
            <TableHeader>
              <HeaderSection width={16}>Type</HeaderSection>
              <HeaderSection width={17}>Launch Date</HeaderSection>
              <HeaderSection width={17}>Total Raise</HeaderSection>
              <HeaderSection width={16}>Token Amount</HeaderSection>
              <HeaderSection width={17}>Min Alloc.</HeaderSection>
              <HeaderSection width={17}>Max Alloc.</HeaderSection>
            </TableHeader>
          </HeadersWrap>
          {IdoListFiltered?.map((idoInfo: any, index: number) => {
            if (activeTab === 'upcoming' && moment(idoInfo?.launchDate).isAfter(moment.now())) {
              return (
                <IdoRow key={index} idoInfo={idoInfo} idoIndex={index} />
              )
            }
            if (activeTab === 'live' && moment(idoInfo?.launchDate).isBefore(moment.now()) && moment(idoInfo?.endDate).isAfter(moment.now())) {
              return (
                <IdoRow key={index} idoInfo={idoInfo} idoIndex={index} />
              )
            }
            if (activeTab === 'finished' && moment(idoInfo?.endDate).isBefore(moment.now())) {
              return (
                <IdoRow key={index} idoInfo={idoInfo} idoIndex={index} />
              )
            }
            return null
          })}
        </ListContainer>
      </PageContainer>
    </>
  )
}
