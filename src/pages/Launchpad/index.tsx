import { ButtonOutlined } from '../../components/Button'
import React, { useMemo, useState } from 'react'

import { ExternalLink, StyledInternalLink, Title, PageHeader } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import IdoRow from '../../components/ZeroGravity/IdoRow'
import PageContainer from '../../components/PageContainer'
import MenuTabs from '../../components/MenuTabs'
import styled from 'styled-components'
import moment from 'moment'
import { useHistory } from 'react-router'

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
  margin-top: 2rem;
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
const HeaderSection = styled.div<{ width?:number }>`
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

export default function ZeroGravityList() {
  const [showActive, setShowActive] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')
  const history = useHistory()
  
  const IdoListComplete = IDO_LIST // fetch this list from the server

  const IdoListFiltered = useMemo(() => {
    if (showActive) {
      return IdoListComplete.filter(item => moment(item?.endDate ?? '').isAfter(moment.now()))
    }
    return IdoListComplete.filter(item => moment(item?.endDate ?? '').isBefore(moment.now()))
  }, [showActive, IdoListComplete])

  const onHandleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }

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
          <StyledExternalLink href="/#">
            <HeaderButton className="launch-button green">Launch My Token</HeaderButton>
          </StyledExternalLink>
          <StyledInternalLink to="/launchpad/kyc">
            <HeaderButton className="green">
              Register
            </HeaderButton>
          </StyledInternalLink>
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
          {IdoListFiltered?.map((idoInfo: any, index:number) => {
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
