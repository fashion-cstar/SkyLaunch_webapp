import { ButtonOutlined } from '../../components/Button'
import React, { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { ExternalLink, StyledInternalLink, Title, PageHeader } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import UserIdoRow from './UserIdoRow'
import PageContainer from '../../components/PageContainer'
import MenuTabs from '../../components/MenuTabs'
import styled from 'styled-components'
import moment from 'moment'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../state'
import formatEther from 'utils/formatEther'
import { useParams } from 'react-router'
import { useFundRaisingContract } from '../../hooks/useContract'
import { Token } from '@skylaunch/sdk'
import Web3Status from 'components/Web3Status'
import { usePoolAndUserInfoCallback, useFundAndRewardTokenCallback, useTotalRewardCallback, useClaimCallback } from 'state/fundraising/hooks'

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
  padding: 30px 20px 20px 20px;  
  background: #1C1C1C;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;
`
const WalletConnectContainer = styled.div`
  min-height: 300px;  
  display: flex;    
  justify-content: center;
  align-items: center;    
  margin-top: 1rem;
  margin-bottom: 2rem;  
  padding-top: 130px;
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
const HeaderSection = styled.div`
  width: 20%;
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

export default function UserIdoDetail() {
  const { library, account, chainId } = useActiveWeb3React()
  const IdoList = useMemo(() => {
    return IDO_LIST.filter(item => moment(item?.endDate ?? '').isAfter(moment.now()))
  }, [IDO_LIST])

  return (
    <>
      <PageHeader>
        <Title>Your Ido Tokens</Title>
      </PageHeader>
      <PageContainer>
        {account ? (<><ListContainer>
          <HeadersWrap>
            <div style={{ minWidth: '160px', width: '160px', height: '20px' }}></div>
            <div style={{ minWidth: '140px', width: '140px' }}></div>
            <TableHeader>
              <HeaderSection>Total Tokens</HeaderSection>
              <HeaderSection>Claimed Tokens</HeaderSection>
              <HeaderSection>Left Tokens</HeaderSection>
              <HeaderSection>Amount To Claim</HeaderSection>
              <HeaderSection>Cliff End Time</HeaderSection>
            </TableHeader>
          </HeadersWrap>
          {IdoList?.map((ido: any, index: number) => {
            return (
              <UserIdoRow key={index} logo={ido.logo} network={ido.network} pid={ido.pid} />
            )
            return null
          })}
        </ListContainer></>) : (<WalletConnectContainer><Web3Status /></WalletConnectContainer>)}
      </PageContainer>
    </>
  )
}
