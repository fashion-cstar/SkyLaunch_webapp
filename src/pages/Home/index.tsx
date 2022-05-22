import { ButtonLight, ButtonPrimary, ButtonSecondary } from 'components/Button'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import { getTVLData, getTVLHistory, getWalletHolderCount } from 'api'
import { NavLink } from 'react-router-dom'
import { PageHeader, CustomLightSpinner } from '../../theme'
import PageContainer from './../../components/PageContainer'
import { TVLHistoryData } from './../../graphql/types'
import Transactions from './../../components/Transactions'
import { useActiveWeb3React } from '../../hooks'
import getPercentageValues from '../../utils/getPercentageValues'
import styled from 'styled-components'
import transactions from '../../graphql/queries/transactions'
import { useQuery } from '@apollo/client'
import useWindowDimensions from './../../hooks/useWindowDimensions'
import { useIdoDetailFromPool } from 'state/fundraising/hooks'
import zeroDayDatas from '../../graphql/queries/zeroDayDatas'
import { dateFormatted } from 'utils/getFormattedMonth'
import { Title } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import moment from 'moment'
import IdoCardList from './components/IdoCardList'

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  margin-bottom: 2rem;
  background: #1A1A1A;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;  
  background-image: url("/images/home_back.png");
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: top;
`
const HeroContainer = styled.div<{ h?: number }>`
  height: ${({ h }) => (h ? h + 'px' : 'auto')};
  width: 100%;
  padding: 60px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 20px;
  `};
`
const SkyLogo = styled.img`
  width: 400px;      
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 300px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 200px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    width: 120px;    
  `};
`
const HeroText = styled.div`  
  font-size: 50px;
  color: #ffffff;
  line-height: 1;
  text-transform: uppercase;  
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 40px;   
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 32px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;    
  `};
`
const HeroDesc = styled.div`  
  font-size: 20px;
  color: #ffffff;  
  text-transform: uppercase;  
  font-weight: 200;
  margin-top: 32px;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 16px;
    margin-top: 24px;
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 14px;
    margin-top: 16px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    margin-top: 12px;
  `};
`
const HeroTextBox = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0px 60px 30px 60px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 10px 30px;
  `};
`
const IndicatorContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
  `};
`
const IndicatorBox = styled.div`
  width: 50%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`
const IndicatorBox2 = styled.div`
  display: flex;
  flex-direction: row;
  width: 50%;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    width: 100%;
    margin-top: 20px;
  `};
`
const IndicatorTitle = styled.div`
  font-size: 18px;
  color: #ffffff;  
  text-transform: uppercase;  
  font-weight: 200;  
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 16px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 14px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;    
  `};
`
const IndicatorContent = styled.div`
  font-size: 40px;
  color: #ffffff;  
  text-transform: uppercase;  
  font-weight: 600;  
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 32px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 26px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;    
  `};
`
const StakeButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 32px;
`
const StyledNavLink = styled(NavLink)`
  text-decoration: none
`
const Heading = styled.div`
  font-size: 40px;
  color: #ffffff;  
  text-transform: uppercase;  
  font-weight: 600;  
  ${({ theme }) => theme.mediaWidth.upToLarge`
    font-size: 32px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 26px;    
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 20px;    
  `};
`
const IdosContainer = styled.div`
  display: flex;
  flex-direction: column;
`
const IdosWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: stretch;
  flex-wrap: wrap;
  margin-top: 1rem;
`
function fnum(x: number) {
  if (isNaN(x)) return { value: x, suffix: '' }

  if (x < 9999) {
    return { value: x, suffix: '' }
  }

  if (x < 1000000) {
    return { value: x / 1000, suffix: 'K' }
  }

  if (x < 1000000000) {
    return { value: x / 1000000, suffix: 'M' }
  }

  if (x < 1000000000000) {
    return { value: x / 1000000000, suffix: 'B' }
  }

  return { value: x / 1000000000000, suffix: 'T' }
}

export default function Home() {
  const { library, account, chainId } = useActiveWeb3React()
  const [pagination, setPagination] = useState<number>(0)
  const [walletHolderCount, setWalletHolderCount] = useState<number>(0)
  const [totalValue, setTotalValue] = useState<number>(26285647.16)
  const [loadingWC, setLoadingWC] = useState(true)
  const [loadingTV, setLoadingTV] = useState(true)
  const [tvlData, setTvlData] = useState<TVLHistoryData[]>([])
  const [IdoListFiltered, setIdoListFiltered] = useState<any[]>([])
  const [IdoLiveFiltered, setIdoLiveFiltered] = useState<any[]>([])
  const [IdoUpcomingFiltered, setIdoUpcomingFiltered] = useState<any[]>([])
  const [IdoCompletedFiltered, setIdoCompletedFiltered] = useState<any[]>([])
  const widthRef = useRef<any>();
  const [containerWidth, setContainerWidth] = useState(0)
  const [isLoadingIdos, setIsLoadingIdos] = useState(false)
  const [cardLiveIndex, setCardLiveIndex] = useState(0)
  const [cardUpcomingIndex, setCardUpcomingIndex] = useState(0)
  const [cardCompletedIndex, setCardCompletedIndex] = useState(0)
  const { getIdoDetailCallback } = useIdoDetailFromPool()

  useEffect(() => {
    if (IDO_LIST) {
      setIsLoadingIdos(true)
      getIdoDetailCallback(IDO_LIST).then((list: any[]) => {        
        setIdoListFiltered(list)
        setIdoUpcomingFiltered(list.filter(idoInfo => moment(idoInfo?.launchDate).isAfter(moment.now())))
        setIdoLiveFiltered(list.filter(idoInfo => moment(idoInfo?.launchDate).isBefore(moment.now()) && moment(idoInfo?.endDate).isAfter(moment.now())))
        setIdoCompletedFiltered(list.filter(idoInfo => moment(idoInfo?.endDate).isBefore(moment.now())))
        setIsLoadingIdos(false)
      }).catch(error => {
        setIdoListFiltered([])
        setIsLoadingIdos(false)
      })
    }
  }, [IDO_LIST, account])

  const getWalletHoldersData = async () => {
    const res = await getWalletHolderCount()
    setLoadingWC(false)
    if (!res.hasError) {
      setWalletHolderCount(res?.total)
    }
  }

  const getTVL = async () => {
    const res = await getTVLData()
    setLoadingTV(false)
    if (!res.hasError) {
      setTotalValue(res?.TVL_total_usd)
    }
  }

  const getHistoryTVL = async () => {
    const res = await getTVLHistory()
    if (!res.hasError) {
      setTvlData(res)
    }
  }

  const getListSize = () => {
    if (widthRef) {
      const newWidth = widthRef?.current?.clientWidth;
      setContainerWidth(newWidth)
    }
  };

  useEffect(() => {
    getHistoryTVL()
    getWalletHoldersData()
    getTVL()
    const newWidth = widthRef?.current?.clientWidth;
    setContainerWidth(newWidth)
    window.addEventListener("resize", getListSize);
  }, [])


  const liveLeftClick = () => {
    if (cardLiveIndex > 0) setCardLiveIndex(cardLiveIndex - 1)
    else setCardLiveIndex(IdoLiveFiltered.length - 1)
  }

  const liveRightClick = () => {
    if (cardLiveIndex < IdoLiveFiltered.length - 1) setCardLiveIndex(cardLiveIndex + 1)
    else setCardLiveIndex(0)
  }

  const upcomingLeftClick = () => {
    if (cardUpcomingIndex > 0) setCardUpcomingIndex(cardUpcomingIndex - 1)
    else setCardUpcomingIndex(IdoUpcomingFiltered.length - 1)
  }

  const upcomingRightClick = () => {
    if (cardUpcomingIndex < IdoUpcomingFiltered.length - 1) setCardUpcomingIndex(cardUpcomingIndex + 1)
    else setCardUpcomingIndex(0)
  }

  const completedLeftClick = () => {
    if (cardCompletedIndex > 0) setCardCompletedIndex(cardCompletedIndex - 1)
    else setCardCompletedIndex(IdoCompletedFiltered.length - 1)
  }

  const completedRightClick = () => {
    if (cardCompletedIndex < IdoCompletedFiltered.length - 1) setCardCompletedIndex(cardCompletedIndex + 1)
    else setCardCompletedIndex(0)
  }

  // make sure to reverse
  const reverseSeries = tvlData?.map((item: TVLHistoryData) => Number(item.TVL_total_usd)).reverse()
  const reverseData = [...tvlData].reverse()
  const lastDataPoint = reverseSeries[reverseSeries.length - 1]
  const index = reverseSeries.length - 2 || 0
  const perc = getPercentageValues(lastDataPoint, reverseSeries[index])
  const formattedDate = reverseData.map((item: any) => dateFormatted(item.date))

  return (
    <>
      <PageHeader>
        <Title>Home</Title>
      </PageHeader>
      <PageContainer>
        <div style={{ width: '100%' }} ref={widthRef}></div>
        <HomeContainer>
          {/* <HeroWrapper src='/images/home_hero.png' /> */}
          <HeroContainer h={containerWidth * 20 / 57}>
            <SkyLogo src='/images/idos/skyfi-logo.png' />
            <HeroTextBox>
              <div>
                <HeroText>
                  The Next Generation<br />
                  Of The IDO Launchpad
                </HeroText>
                <HeroDesc>
                  Only the finest projects launch with skylaunch
                </HeroDesc>
              </div>
            </HeroTextBox>
          </HeroContainer>
          <HomeWrapper>
            <IndicatorContainer>
              <IndicatorBox2>
                <IndicatorBox>
                  <div>
                    <IndicatorTitle>Total Value Staked</IndicatorTitle>
                    <IndicatorContent>${totalValue.toLocaleString()}</IndicatorContent>
                  </div>
                </IndicatorBox>
                <IndicatorBox>
                  <div>
                    <IndicatorTitle>Unique Stakers</IndicatorTitle>
                    <IndicatorContent>{walletHolderCount.toLocaleString()}</IndicatorContent>
                  </div>
                </IndicatorBox>
              </IndicatorBox2>
              <IndicatorBox2>
                <IndicatorBox>
                  <div>
                    <IndicatorTitle>SkyFi Staked</IndicatorTitle>
                    <IndicatorContent>{Number(7126633).toLocaleString()}</IndicatorContent>
                  </div>
                </IndicatorBox>
                <IndicatorBox>
                  <div>
                    <IndicatorTitle>APY</IndicatorTitle>
                    <IndicatorContent>{Number(47.42).toLocaleString()}%</IndicatorContent>
                  </div>
                </IndicatorBox>
              </IndicatorBox2>
            </IndicatorContainer>
            <StakeButtonContainer>
              <StyledNavLink id={`stake-nav-link`} to={`/stake`}>
                <ButtonSecondary style={{ width: '180px', height: '40px', textTransform: 'uppercase', color: '#111', fontSize: '20px' }}>Stake SkyFi</ButtonSecondary>
              </StyledNavLink>
            </StakeButtonContainer>
            <IdosContainer>
              <Heading>LIVE IDO'S</Heading>
              <IdosWrapper>
                <IdoCardList IdoFiltered={IdoLiveFiltered} idoType={0} options={null} />                
              </IdosWrapper>
            </IdosContainer>
            <IdosContainer>
              <Heading>UPCOMING IDO'S</Heading>
              <IdosWrapper>
                <IdoCardList IdoFiltered={IdoUpcomingFiltered} idoType={1} options={null} />                
              </IdosWrapper>
            </IdosContainer>
            <IdosContainer>
              <Heading>CLOSED IDO'S</Heading>
              <IdosWrapper>
                <IdoCardList IdoFiltered={IdoCompletedFiltered} idoType={2} options={null} />                
              </IdosWrapper>
            </IdosContainer>
            {/* <HowToContainer>
              <Header>
                <Heading>How to participate</Heading>
                <Summary>
                  To participate in a SkyLaunch IDO, select launchpad on the left menu. You can participate in the selection of IDOs listed under the ‘live’ selection immediately, and once the functionality is in place we will have the option to select and participate in upcoming IDOs. Your IDO allocation is determined by your allocation score, which you can find on our SKYFI stakepad. This score is determined by your SKYFI staking and takes into account amount staked, length of stake, and number of days since your last withdrawal. IDO participation follows 5 key steps:
                </Summary>
                <ListSection>
                  <li>Ensure you have SKYFI token staked to establish your score for IDOs.</li>
                  <li>Go to the Launchpad tab and click Detail next to the IDO you are interested in.</li>
                  <li>If the IDO is live you can click the SUBSCRIBE button. This will allow you to join the pool of interested potential investors.</li>
                  <li>At the end of the subscription period, on the same IDO page you can click FUND.</li>
                  <li>Once the funding phase is completed, click ‘USER IDO TOKENS’ in the left menu and claim your tokens.</li>
                </ListSection>
              </Header>
            </HowToContainer> */}
          </HomeWrapper>
        </HomeContainer>
      </PageContainer>
    </>
  )
}
