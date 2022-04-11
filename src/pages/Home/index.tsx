import { ButtonLight, ButtonPrimary } from 'components/Button'
import React, { useEffect, useState, useMemo } from 'react'
import { getTVLData, getTVLHistory, getWalletHolderCount } from 'api'

import Bubble from './../../components/Bubble'
import BubbleChart from './../../components/BubbleChart'
import Circle from '../../assets/images/blue-loader.svg'
import { PageHeader, CustomLightSpinner } from '../../theme'
import PageContainer from './../../components/PageContainer'
import { TVLHistoryData } from './../../graphql/types'
import Transactions from './../../components/Transactions'
import getPercentageValues from '../../utils/getPercentageValues'
import styled from 'styled-components'
import transactions from '../../graphql/queries/transactions'
import { useQuery } from '@apollo/client'
import useWindowDimensions from './../../hooks/useWindowDimensions'
import zeroDayDatas from '../../graphql/queries/zeroDayDatas'
import { dateFormatted } from 'utils/getFormattedMonth'
import { Title } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import moment from 'moment'
import UpcomingIdoRow from './UpcomingIdoRow'

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  margin-bottom: 2rem;
  background: #1A1A1A;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;  
`

const HomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px 60px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 10px 30px;
  `};
`

const Header = styled.div`
  // text-transform: uppercase;
`
const Heading = styled.div`
  margin-top: 25px;
  font-size: 20px;
  font-weight: 700;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 15px;
    font-size: 18px;
    text-align: center;
  `};
`
const HowToHeading = styled.div`
  font-size: 17px;
  font-weight: 500;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
    text-align: center;
  `};
`
const Summary = styled.div`
  margin-bottom: 1rem;  
  margin-top: 20px;
  font-size: 14px;
  color: #b0b0b0;
  line-height: 1.4;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    text-align: center;
  `};
`
const WelcomeContainer = styled.div`
`
const ScoreMiningContainer = styled.div`
`
const HowToContainer = styled.div`
  margin-top: 10px;
`
const ListSection = styled.ul`
  font-size: 14px;
  color: #b0b0b0;
  line-height: 1.4;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;  
  `};
`
const UpcomingIdosContainer = styled.div`
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

const HeroWrapper = styled.img`  
  width: 100%;    
  border-radius: 15px;
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
  const [pagination, setPagination] = useState<number>(0)
  const [walletHolderCount, setWalletHolderCount] = useState<number>(0)
  const [totalValue, setTotalValue] = useState<number>(26285647.16)
  const [loadingWC, setLoadingWC] = useState(true)
  const [loadingTV, setLoadingTV] = useState(true)
  const [tvlData, setTvlData] = useState<TVLHistoryData[]>([])
  const IdoListComplete = IDO_LIST // fetch this list from the server
  const [showActive, setShowActive] = useState(true)
  const { width } = useWindowDimensions()
  const zeroData = useQuery(zeroDayDatas)

  const IdoListFiltered = useMemo(() => {
    if (showActive) {
      return IdoListComplete.filter(item => moment(item?.endDate ?? '').isAfter(moment.now()))
    }
    return IdoListComplete.filter(item => moment(item?.endDate ?? '').isBefore(moment.now()))
  }, [showActive, IdoListComplete])

  const transactionsData = useQuery(transactions, {
    variables: {
      first: 12,
      skip: pagination * 12
    }
  })

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
  useEffect(() => {
    getHistoryTVL()
    getWalletHoldersData()
    getTVL()
  }, [])

  const isColumn = width < 1500

  const onClickPrevPage = () => {
    setPagination(pagination - 1)
  }

  const onClickNextPage = () => {
    setPagination(pagination + 1)
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
        <HomeContainer>
          <HeroWrapper src='/images/home_hero.png' />
          <HomeWrapper>
            <WelcomeContainer>              
              <Header>
                <Heading>Welcome to SkyLaunch</Heading>
                <Summary>
                  SkyLaunch is the next generation of launchpad and a project lifetime partner. Only the finest quality early stage blockchain projects make it to the IDO stage with SkyLaunch. Each project that becomes listed for their IDO with us, you can rest assured, has been thoroughly researched from every perspective to both ensure project quality and minimise financial risk for our investors. Furthermore, each and every project will gain access to a stellar network of partners through our post-IDO Alliance Network, ensuring growth, prosperity and success.                
                </Summary>
              </Header>
            </WelcomeContainer>
            <UpcomingIdosContainer>
              <Heading>UPCOMING IDOS</Heading>              
              <IdosWrapper>
                {IdoListFiltered?.map((idoInfo: any, index:number) => {
                  if (moment(idoInfo?.launchDate).isAfter(moment.now())) {
                    return (
                      <UpcomingIdoRow key={index} idoInfo={idoInfo} idoIndex={index} />
                    )
                  }               
                  return null
                })}
              </IdosWrapper>              
            </UpcomingIdosContainer>
            <HowToContainer>              
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
              </HowToContainer>
            <ScoreMiningContainer>              
              <Header>
                <Heading>Score Mining - A fairer allocation system for everyone</Heading>
                <Summary>
                  Simply stake our native token - SKYFI - to grow your allocation score in real time. We have given you total control of your allocation!
                </Summary>
              </Header>
            </ScoreMiningContainer>
            {/* <Flex isColumn={isColumn}>
              {!tvlData.length ? (
                <CenterWrap>
                  <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
                </CenterWrap>
              ) : (
                <>
                  <BubbleChart
                    type="line"
                    categoriesX={formattedDate}
                    title="Liquidity"
                    value={lastDataPoint}
                    series={reverseSeries}
                    percentage={perc}
                  />
                  <BubbleMarginWrap>
                    {loadingTV || loadingWC ? (
                      <CenterWrap>
                        <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
                      </CenterWrap>
                    ) : (
                      <>
                        <Bubble variant="pink" color="#A7B1F4" title="Wallet Holders" showMountains={true}>
                          {new Intl.NumberFormat().format(walletHolderCount)}
                        </Bubble>
                        <Bubble
                          variant="purple"
                          color="#A7B1F4"
                          prefix="$"
                          suffix={fnum(totalValue)?.suffix}
                          title="Total Value Locked"
                          showMountains={true}
                        >
                          {fnum(totalValue)?.value?.toFixed(3)}
                        </Bubble>
                      </>
                    )}
                  </BubbleMarginWrap>
                </>
              )}
            </Flex> */}
            {/* {transactionsData.loading || !transactionsData.data?.transactions ? (
              <CenterWrap>
                <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
              </CenterWrap>
            ) : (
              <>
                <Transactions transactions={transactionsData.data?.transactions} />
                <FlexButtons>
                  {pagination > 0 && (
                    <Button>
                      <ButtonLight onClick={onClickPrevPage}>Back</ButtonLight>
                    </Button>
                  )}
                  {transactionsData.data?.transactions.length >= 12 && (
                    <Button>
                      <ButtonPrimary onClick={onClickNextPage}>Next</ButtonPrimary>
                    </Button>
                  )}
                </FlexButtons>
              </>
            )} */}
          </HomeWrapper>
        </HomeContainer>
      </PageContainer>
    </>
  )
}
