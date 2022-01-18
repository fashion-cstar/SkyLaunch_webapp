import React, { useEffect, useMemo, useState } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import { useParams } from 'react-router'
import { IDO_LIST } from 'constants/idos'
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import BlockchainLogo from '../../../components/BlockchainLogo'

import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';

const IdoDetails = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  padding: 0 40px;
`

const BgWrapper = styled.div`
  background: #1c1c1c;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;
  margin-bottom: 8rem;
  margin-top: 4rem;
  padding: 30px 60px;
  width: 100%;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 16px;
    padding: 20px;
  `};
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 32px;
  text-transform: uppercase;
`

const HeadingContainer = styled.div`
  display: flex;
  align-items: center;
`

const Heading = styled.div`
  margin: 1rem 0;
`

const HeadingDate = styled.div`
  margin-left: 30px;
  font-size: 14px;
  font-weight: 400;
`

const HeadingTime = styled.div`
  margin-left: 30px;
  font-size: 14px;
`

const ContractContainer = styled.div`
  p {
    margin: 25px 0 5px;
  }
`

const ContractInfo = styled.div`
  display: flex;
  align-items: center;

  p {
    margin: 0 0 0 20px;
  }
`

const SeedSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const SeedItem = styled.div`
  width: 20%;
  margin-right: 5%;
`

const SeedItemTitle = styled.p`
  display: flex;
  align-items: flex-end;
  height: 70px;
  margin: 0;
  font-weight: 600;
  line-height: 20px;
`

const SeedItemValue = styled.p`
  margin: 15px 0 20px;
`

const GraphContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 -50px;
  font-size: 12px;
`

const GuideContainer = styled.div`
`

const GuideTitle = styled.p`
`

const GuideContent = styled.p`
`

export default function IdoDetailComponent() {
  const { idoURL } = useParams<{ idoURL: string }>()
  const [idoData, setIdoData] = useState<any>()
  const [activeIndex, setActiveIndex] = useState(0)
  useEffect(() => {
    // fetch data here
    setIdoData(IDO_LIST.find(item => item.idoURL === idoURL))
  }, [idoURL])

  const goToSite = (str: string) => {
    window.open(str, '_blank')
  }

  const data = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, payload, value, label } = props
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    const delta = ex > sx ? 50 : -50;

    return (
      <g>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#9384db" />
            <stop offset="100%" stop-color="#d59582" />
          </linearGradient>
        </defs>
        <path d={`M${sx},${sy}L${mx},${my}L${ex+delta},${ey}`} stroke="url(#gradient)" fill="none" />
        <circle cx={sx} cy={sy} r={4} fill="#1c1c1c" stroke="url(#gradient)" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={-3} textAnchor={textAnchor} fill="#fff">{label}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#fff">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
      </g>
    );
  };

  return (
    <>
      <IdoDetails>
        <BgWrapper>
          <Header>
            <HeadingContainer>
              <Heading>IDO Details</Heading>
              <HeadingDate>May 06, 2022</HeadingDate>
              <HeadingTime>09:00PM</HeadingTime>
            </HeadingContainer>
            <ButtonSecondary style={{ width: '120px', padding: '5px 0', textTransform: 'uppercase' }}>Participate</ButtonSecondary>
          </Header>
          <ContractContainer>
            <p>Contracts</p>
            <ContractInfo>
              <BlockchainLogo size="28px" blockchain={'BNB'} />
              <p>Binance Smart Chain</p>
              <p>0xf67932d8c28227c586d971b6b51749d35dc03558</p>
            </ContractInfo>
          </ContractContainer>
          <SeedSection>
            <SeedItem>
              <SeedItemTitle>Token Allocation</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.tokenAllocation}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>% Of Total Tokens</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.totalTokenPercent}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Token Price</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.tokenPrice}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Total Raised</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.totalRaised}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Lockup Period</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.lockPeriod}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Vesting Period Post Lockup(M)</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.vestingPeriod}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>% At TGE</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.tgePercent}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Minimum Alloc</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.allocationMin}</SeedItemValue>
            </SeedItem>
          </SeedSection>
          <GraphContainer>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart width={400} height={400}>
                <Pie
                  data={idoData?.tokenAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={25}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={500}>
              <PieChart width={400} height={400}>
                <Pie
                  data={idoData?.tokenAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  innerRadius={25}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </GraphContainer>
          <GuideContainer>
            <GuideTitle>How to participate</GuideTitle>
            <GuideContent>{idoData?.description}</GuideContent>
          </GuideContainer>
        </BgWrapper>
      </IdoDetails>
    </>
  )
}