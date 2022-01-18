import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router'

import DetailComponent from './components/Detail'
import SeedRoundComponent from './components/SeedRound'
import IdoDetailComponent from './components/IdoDetail'
import { IDO_LIST } from 'constants/idos'
import PageContainer from '../../components/PageContainer'
import MenuTabs from '../../components/MenuTabs'
import { PageHeader } from '../../theme'
import WISESale from './wiseSale'
import WSDSale from './wsdSale'
import GrowSale from './growSale'
import moment from 'moment'
import styled from 'styled-components'

const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  margin-top: 20px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    display: flex;
    justify-content: center;
  `};
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
  margin-bottom: 53px;
  p {
    margin-right: 15px;
  }
`

export default function ZeroGravityInfo() {
  const { idoURL, idoIndex } = useParams<{ idoURL: string, idoIndex: string }>()
  const history = useHistory()
  const [activeTab, setActiveTab] = useState('detail')
  const [idoData, setIdoData] = useState<any>()

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
      return `${moment(idoData?.launchDate ?? '').format('ll')}`
  }, [idoData])

  const launchTime = useMemo<string>(() => {
    return `${moment(idoData?.launchDate ?? '').format('hh:mm A')}`
  }, [idoData])

  useEffect(() => {
    // fetch data here
    setIdoData(IDO_LIST.find(item => item.idoURL === idoURL))
  }, [idoURL])

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
      name: 'Seed Round',
      value: 'seed'
    },
    {
      name: 'IDO Details',
      value: 'ido'
    }
  ]

  return (
    <>
      <PageHeader>
        <InfoSection>
          <LogoWrapper>
            <img src={idoData?.logo ?? ''} alt={idoData?.idoURL ?? ''} />
          </LogoWrapper>
          <p>{launchString}</p>
          <p>{launchDate}</p>
          <p>{launchTime}</p>
        </InfoSection>
        <HeaderContainer>
          <MenuTabs
            tabs={tabs}
            active={activeTab}
            onChange={onHandleChangeTab}
          />
        </HeaderContainer>
      </PageHeader>
      <PageContainer>
        {idoData?.idoURL == 'wise' ? (
          <WISESale />
        ) : idoData?.idoURL == 'wasder' ? (
          <WSDSale />
        ) : (
          // : idoData?.idoURL == 'grow' ? <GrowSale />
          <></>
        )}
        {activeTab === 'detail' &&
          <DetailComponent />
        }
        {activeTab === 'seed' &&
          <SeedRoundComponent />
        }
        {activeTab === 'ido' &&
          <IdoDetailComponent />
        }
      </PageContainer>
    </>
  )
}
