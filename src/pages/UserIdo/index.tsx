import { ButtonOutlined } from '../../components/Button'
import React, { useEffect, useMemo, useState } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { Title, PageHeader } from '../../theme'
import { IDO_LIST } from '../../constants/idos'
import UserIdoRow from './UserIdoRow'
import PageContainer from '../../components/PageContainer'
import styled from 'styled-components'
import moment from 'moment'
import Web3Status from 'components/Web3Status'
import { useIdoDetailFromPool } from 'state/fundraising/hooks'
import { PoolInfo } from 'state/fundraising/actions'
import formatEther from 'utils/formatEther'
import Circle from '../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from 'theme'

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
  align-items: end;
`

const CenterWrap = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 1rem 0;
`

export default function UserIdoDetail() {
  const { library, account, chainId } = useActiveWeb3React()  
  const [IdoList, setIdoList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { getIdoDetailCallback } = useIdoDetailFromPool()
  // const IdoList = useMemo(() => {
  //   return IDO_LIST.filter(item => moment(item?.endDate ?? '').isAfter(moment.now()))
  // }, [IDO_LIST])

  useEffect(() => {
    if (IDO_LIST){
      setIsLoading(true)      
      getIdoDetailCallback(IDO_LIST).then((list:any[]) => {
        setIdoList(list)         
        setIsLoading(false)             
      }).catch(error => {        
        setIdoList([])
        setIsLoading(false)      
      })                  
    }
  }, [IDO_LIST])

  return (
    <>
      <PageHeader>
        <Title>Your Ido Tokens</Title>
      </PageHeader>
      <PageContainer>
        {account ?
          <ListContainer>
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
            {isLoading ?
              <CenterWrap>
                < CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
              </CenterWrap> :
              <>
                {IdoList?.map((ido: any, index: number) => {
                  return (
                    <UserIdoRow key={index} logo={ido.logo} network={ido.network} pid={ido.pid} />
                  )
                })}
              </>
            }
          </ListContainer>
          : <WalletConnectContainer><Web3Status /></WalletConnectContainer>}
      </PageContainer>
    </>
  )
}
