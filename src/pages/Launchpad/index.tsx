import { Button as RebassButton } from 'rebass/styled-components'
import React, { useEffect, useState, useCallback } from 'react'

import { ExternalLink, Title, PageHeader } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import IdoRow from '../../components/ZeroGravity/IdoRow'
import PageContainer from '../../components/PageContainer'
import MenuTabs from '../../components/MenuTabs'
import styled from 'styled-components'
import moment from 'moment'
import { useHistory } from 'react-router'
import { useIdoDetailFromPool, useIsFormSent, useKYCStatus } from 'state/fundraising/hooks'
import { useActiveWeb3React } from '../../hooks'
import formatEther from 'utils/formatEther'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from 'theme'

const HeaderContainer = styled.div`  
  width: 100%;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
  `};
`

const HeaderButton = styled.div`
  padding: 8px 20px;
  border-radius: 50px;
  background: linear-gradient(to right, #9384DC, #D49583);
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
  padding: 30px 20px 30px 20px;  
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
  align-items: end;
`

const CenterWrap = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 1rem 0;
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
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  display: ${({ isKYCed }) => (isKYCed ? 'none' : 'block')};
  text-transform: uppercase;
  background: linear-gradient(#1c1c1c, #1c1c1c) padding-box, 
  linear-gradient(to right, #9384DC, #D49583);
  background-origin: padding-box, border-box;
  background-repeat: no-repeat;
  border: 2px solid transparent;
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  &:disabled {
    opacity: 50%;
    cursor: auto;
  }
`

const LaunchPadTitle = styled.div`
  width: 100%;
  font-size: 70px;
  font-weight: 600;
${({ theme }) => theme.mediaWidth.upToMedium`
  text-align: center;
  font-size: 50px;
  font-weight: 500;
  margin-top: 10px;
  margin-bottom: 10px;
`};
`

export default function ZeroGravityList() {
  const { library, account, chainId } = useActiveWeb3React()
  const [activeTab, setActiveTab] = useState('upcoming')
  const history = useHistory()
  const IsFormSent = useIsFormSent()
  const { isKYCed } = useKYCStatus()
  const { getIdoDetailCallback } = useIdoDetailFromPool()
  const [IdoListFiltered, setIdoListFiltered] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const onHandleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    if (IDO_LIST){
      setIsLoading(true)      
      getIdoDetailCallback(IDO_LIST).then((list:any[]) => {
        setIdoListFiltered(list)         
        setIsLoading(false)             
      }).catch(error => {        
        setIdoListFiltered([])
        setIsLoading(false)      
      })                  
    }
  }, [IDO_LIST, account])

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
        <LaunchPadTitle>Launchpad</LaunchPadTitle>
        <StyledButtonsWrap>
          <StyledExternalLink href="https://skylaunch.finance/wp-content/uploads/2022/01/SkyLaunch-application-form.docx" target='_blank'>
            <HeaderButton className="launch-button green">Launch My Token</HeaderButton>
          </StyledExternalLink>
          <ButtonRegister width={isKYCed ? "190px" : "140px"} padding="6px 25px" onClick={handleRegisterClick} disabled={IsFormSent || isKYCed}>{IsFormSent ? 'In Progress' : isKYCed ? 'KYC Approved' : 'Register'}</ButtonRegister>
        </StyledButtonsWrap>
        <HeaderContainer>
          <MenuTabs
            tabs={tabs}
            active={activeTab}
            separated={false}
            onChange={onHandleChangeTab}
          />
        </HeaderContainer>
      </PageHeader>
      <PageContainer>
        <ListContainer>
          <HeadersWrap>
            <div style={{ minWidth: '120px', width: '120px', height: '20px' }}></div>
            <div style={{ minWidth: '160px', width: '160px' }}></div>
            <TableHeader>
              <HeaderSection width={16}>Type</HeaderSection>
              <HeaderSection width={17}>Launch Date</HeaderSection>
              <HeaderSection width={17}>Target Raise</HeaderSection>
              <HeaderSection width={16}>Token Amount</HeaderSection>
              <HeaderSection width={17}>IDO Price</HeaderSection>
              <HeaderSection width={17}>Max Alloc</HeaderSection>
            </TableHeader>
          </HeadersWrap>
          {isLoading ?
            <CenterWrap>
              < CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
            </CenterWrap> :
            <>
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
            </>
          }
        </ListContainer>
      </PageContainer>
    </>
  )
}
