import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { useActiveWeb3React } from '../../hooks'
import DetailComponent from './components/detail'
import SeedRoundComponent from './components/SeedRound'
import IdoDetailComponent from './components/IdoDetail'
import { IDO_LIST } from 'constants/idos'
import PageContainer from '../../components/PageContainer'
import MenuTabs from '../../components/MenuTabs'
import { PageHeader } from '../../theme'
import moment from 'moment'
import styled from 'styled-components'
import { useIdoDetailFromPool } from 'state/fundraising/hooks'

const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
`
const IdoDetails = styled.div`  
  margin-top: 2rem;
  margin-bottom: 2rem;
  border-radius: 15px;
  background: #1c1c1c;
`
const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 160px;
  margin-right: 30px;
  img {
    max-height: 120px;
    max-width: 100%;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    margin-bottom: 1rem;
    margin-top: 1rem;
  `};
`
const InfoSection = styled.div`
  margin: 1rem 0;
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;  
  p {
    margin-right: 15px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-content: center;
  `};
`
const HeroWrapper = styled.img`  
  width: 100%;      
  border-radius: 15px 15px 0px 0px;
  display: block;
`
const LaunchTimeContainer = styled.div`
  display: flex
`
const PhaseContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  background-color: #000;
  padding: 20px 16px;
`
const PhaseBox = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
`
const PhaseTextActive = styled.div`  
  background-color: #79E295;
  background-image: linear-gradient(45deg, #79E295, #349F9C);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;

  font-size: 14px;
  font-weight: 700; 
  text-transform: uppercase;
`
const PhaseTextInActive = styled.div`    
  font-size: 14px;
  font-weight: 700; 
  color: #909090;
  text-transform: uppercase;
`
export default function ZeroGravityInfo() {
  const { library, account, chainId } = useActiveWeb3React()
  const { idoURL, idoIndex } = useParams<{ idoURL: string, idoIndex: string }>()
  const history = useHistory()
  const [activeTab, setActiveTab] = useState('detail')
  const [idoData, setIdoData] = useState<any>()
  const { getIdoDetailCallback } = useIdoDetailFromPool()
  const [isLoadingIdos, setIsLoadingIdos] = useState(false)
  const [phaseno, setPhaseNo] = useState(0)

  const launchString = useMemo<string>(() => {
    if (idoData?.launchDate) {
      if (moment(idoData.launchDate).isBefore(moment.now())) {
        return `Launched`
      }
      return `Launch`
    }
    return ''
  }, [idoData])

  const launchDate = useMemo<string>(() => {
    if (idoData)
      return `${moment(idoData?.launchDate ?? '').format('ll')}`
    else
      return ''
  }, [idoData])

  const launchTime = useMemo<string>(() => {
    if (idoData)
      return `${moment(idoData?.launchDate ?? '').format('hh:mm A')}`
    else
      return ''
  }, [idoData])

  useEffect(() => {
    // fetch data here
    let ido = IDO_LIST.find(item => item.idoURL === idoURL)
    if (ido) {
      let l: any[] = []
      l.push(ido)
      setIsLoadingIdos(true)
      getIdoDetailCallback(l).then((list: any[]) => {
        setIdoData(list[0])
        setIsLoadingIdos(false)
      }).catch(error => {
        setIdoData(ido)
        setIsLoadingIdos(false)
      })
    }
  }, [idoURL])

  useEffect(() => {
    if (idoData) {
      if (moment(idoData?.launchDate).isAfter(moment.now())) setPhaseNo(0)
      if (moment(idoData?.launchDate).isBefore(moment.now()) && moment(idoData?.endDate).isAfter(moment.now())) setPhaseNo(1)
      if (moment(idoData?.endDate).isBefore(moment.now())) setPhaseNo(2)
    }
  }, [idoData])

  const onHandleChangeTab = (tab: string) => {
    setActiveTab(tab)
  }

  const goToKyc = (idoData: any) => {
    if (idoData.kycURL) {
      window.open(idoData.kycURL, '_blank')
    } else {
      history.push(`/launchpad/${idoURL}/kyc`)
    }
  }

  const tabs = [
    {
      name: 'Details',
      value: 'detail'
    },    
    {
      name: 'IDO Details',
      value: 'ido'
    },
    {
      name: 'Seed Round',
      value: 'seed'
    },
    {
      name: 'Team',
      value: 'team'
    }
  ]

  return (
    <>
      <PageHeader>
        <InfoSection>
          <LogoWrapper>
            <img src={idoData?.logo ?? ''} alt={idoData?.idoURL ?? ''} />
          </LogoWrapper>
          <LaunchTimeContainer>
            <p>{launchString}</p>
            <p>{launchDate}</p>
            <p>{launchTime}</p>
          </LaunchTimeContainer>
        </InfoSection>
      </PageHeader>
      <PageContainer>
        <IdoDetails>
          <HeroWrapper src={IDO_LIST.find(item => item.idoURL === idoURL)?.hero} />
          <PhaseContainer>
            <PhaseBox>
              <PhaseTextActive>Whitelist</PhaseTextActive>
              <img src="./images/passedCheck.png" width="50px" height="fit-content" />
            </PhaseBox>
            <PhaseBox>
              <PhaseTextActive>Solr Pool Ido</PhaseTextActive>
              <img src="./images/passedCheck.png" width="50px" height="fit-content" />
            </PhaseBox>
            <PhaseBox>
              {phaseno > 0 ? <>
                <PhaseTextActive>Open Pool No.1</PhaseTextActive>
                <img src="./images/passedCheck.png" width="50px" height="fit-content" />
              </> :
                <>
                  <PhaseTextInActive>Open Pool No.1</PhaseTextInActive>
                  <img src="./images/notPassed.png" width="50px" height="fit-content" />
                </>}
            </PhaseBox>
            <PhaseBox>
              {phaseno > 0 ? <>
                <PhaseTextActive>Open Pool No.2</PhaseTextActive>
                <img src="./images/passedCheck.png" width="50px" height="fit-content" />
              </> :
                <>
                  <PhaseTextInActive>Open Pool No.2</PhaseTextInActive>
                  <img src="./images/notPassed.png" width="50px" height="fit-content" />
                </>}
            </PhaseBox>
            <PhaseBox>
              {phaseno > 1 ?
                <PhaseTextActive>Claim Tokens</PhaseTextActive> :
                <PhaseTextInActive>Claim Tokens</PhaseTextInActive>}
            </PhaseBox>
          </PhaseContainer>
          <HeaderContainer>
            <MenuTabs
              tabs={tabs}
              active={activeTab}
              separated={true}
              onChange={onHandleChangeTab}
            />
          </HeaderContainer>
          {activeTab === 'detail' &&
            <DetailComponent />
          }
          {activeTab === 'seed' &&
            <SeedRoundComponent />
          }
          {activeTab === 'ido' &&
            <IdoDetailComponent />
          }
        </IdoDetails>
      </PageContainer>
    </>
  )
}
