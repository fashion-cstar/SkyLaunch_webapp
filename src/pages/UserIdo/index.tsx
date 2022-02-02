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
import toEtherAmount from 'utils/toEtherAmount'
import { useParams } from 'react-router'
import { useFundRaisingContract } from '../../hooks/useContract'
import { Token } from '@skylaunch/sdk'
import Web3Status from 'components/Web3Status'
import { useFundRaisingCallback, useFundAndRewardToken, useTotalReward, useClaimCallback } from 'state/fundraising/hooks'

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
  margin-top: 2rem;
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
  width: 25%;
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
    const [showActive, setShowActive] = useState(true)
    const [activeTab, setActiveTab] = useState('upcoming')    
    const { idoURL } = useParams<{ idoURL: string }>()
    const [idoData, setIdoData] = useState<any>()
    const { library, account, chainId } = useActiveWeb3React()
    const fundRaisingContract = useFundRaisingContract()        
    const [showClaimModal, setShowClaimModal] = useState(false)    
    const [pid, setPid] = useState(-1)      
    const [pendingAmount, setPendingAmount] = useState(0);      
    const [fundToken, setFundToken] = useState<Token | undefined>()
    const [rewardToken, setRewardToken] = useState<Token | undefined>()
    const [countsOfPool, setCountsOfPool]=useState(0)
    const { poolInfoCallback, userInfoCallback, countsOfPoolCallback } = useFundRaisingCallback()
    const { totalRewardCallback } = useTotalReward(account)
    const { pendingCallback } = useClaimCallback(account)
    const { rewardTokenCallback, fundTokenCallback } = useFundAndRewardToken(account)
    const [userIdos, setUserIdos] = useState<any>([])
    const IdoList = useMemo(() => {
        if (showActive) {
        return IDO_LIST.filter(item => moment(item?.endDate ?? '').isAfter(moment.now()))
        }
        return IDO_LIST.filter(item => moment(item?.endDate ?? '').isBefore(moment.now()))
    }, [showActive, IDO_LIST])

    // const IdoListFiltered 
    useEffect(() => {
      const fetch=async () =>{
        await Promise.all(IdoList.map(async (ido, index) => {
          if (index<countsOfPool){                                   
            if (ido.network===chainId){              
              let poolInfo=await poolInfoCallback(index)
              let userInfo=await userInfoCallback(index)
              if (userInfo?.fundingAmount.gt(0) && poolInfo && userInfo){                               
                let totalReward=await totalRewardCallback(index)                
                let rewardToken=await rewardTokenCallback(poolInfo.rewardToken)                 
                let fundToken=await fundTokenCallback(poolInfo.fundRaisingToken)
                if (poolInfo?.rewardsStartTime.gt(0)){
                  let pendingReward=await pendingCallback(index)                  
                  if (totalReward && pendingReward && rewardToken){                    
                    let total=toEtherAmount(totalReward,rewardToken,2)
                    let pending=toEtherAmount(pendingReward,rewardToken,2)
                    let collected=toEtherAmount(userInfo.collectedRewards,rewardToken,2)
                    let left=Math.round((total-pending-collected)*100)/100
                    let type=1 //claim
                    if (pending===0) type=2 //nothing to claim
                    let data:any={idoURL:ido.idoURL, logo:ido.logo, totalTokens:total, 
                      claimedTokens:collected, leftTokens:left, amountToClaim:pending, 
                      type:type, pid:index, poolInfoData:poolInfo, userInfoData:userInfo, 
                      rewardToken:rewardToken, fundToken:fundToken}
                    setUserIdos((oldArray:any) => [...oldArray, data]);
                  }
                }else{                                   
                  if (totalReward && rewardToken){                    
                    let total=toEtherAmount(totalReward,rewardToken,2)
                    let type=2 //nothing to claim
                    let data:any={idoURL:ido.idoURL, logo:ido.logo, totalTokens:total, 
                      claimedTokens:0, leftTokens:total, amountToClaim:0, 
                      type:type, pid:index, poolInfoData:poolInfo, userInfoData:userInfo, 
                      rewardToken:rewardToken, fundToken:fundToken}
                    setUserIdos((oldArray:any) => [...oldArray, data]);
                  }
                }
              }
            }else{
              let type=3 //change network
              let data:any={idoURL:ido.idoURL, logo:ido.logo, totalTokens:0, claimedTokens:0, leftTokens:0, amountToClaim:0, type:type}
              setUserIdos((oldArray:any) => [...oldArray, data]);
            }
          }
        }))
      }
      if (IdoList && countsOfPool){   
        setUserIdos([])
        fetch()
      }
    }, [IdoList, countsOfPool, chainId])
   
    useEffect(() => {
      if (account){      
        countsOfPoolCallback().then(res => {         
          setCountsOfPool(res) 
        }).catch(error => { setCountsOfPool(0) })
      }
    }, [account])

    return (
        <>
        <PageHeader>
            <Title>Your Ido Tokens</Title>           
        </PageHeader>
        <PageContainer>
          {account?(<><ListContainer>
              <HeadersWrap>
                  <div style={{ minWidth: '160px', width: '160px', height: '20px' }}></div>
                  <div style={{ minWidth: '140px', width: '140px' }}></div>
                  <TableHeader>
                  <HeaderSection>Total Tokens</HeaderSection>
                  <HeaderSection>Claimed Tokens</HeaderSection>
                  <HeaderSection>Left Tokens</HeaderSection>
                  <HeaderSection>Amount To Claim</HeaderSection>     
                  </TableHeader>
              </HeadersWrap>
              {userIdos?.map((idoInfo: any, index:number) => {               
                  return (
                      <UserIdoRow key={index} idoInfo={idoInfo} idoIndex={index} />
                  )                
                  return null
              })}
            </ListContainer></>):(<WalletConnectContainer><Web3Status /></WalletConnectContainer>)}
        </PageContainer>
        </>
    )
}
