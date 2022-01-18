import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { PoolInfo, UserInfo, setPoolInfo, setUserInfo, setIsKYCed, setIsSubscribed, setProgressPhase, setPoolID } from './actions'
import kycMerkleRoot from '../../constants/abis/kycMerkleRoot.json';
import { ZERO_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCallback, useEffect, useRef, useState } from 'react'

export function usePoolInfoData(): AppState['fundraising']['poolInfo'] {
    return useSelector<AppState, AppState['fundraising']['poolInfo']>(state => state.fundraising.poolInfo)    
}

export function useUserInfoData(): AppState['fundraising']['userInfo'] {
    return useSelector<AppState, AppState['fundraising']['userInfo']>(state => state.fundraising.userInfo)    
}

export function useUserKYCed(): AppState['fundraising']['isKYCed'] {
    return useSelector<AppState, AppState['fundraising']['isKYCed']>(state => state.fundraising.isKYCed)    
}

export function useUserSubscribed(): AppState['fundraising']['isSubscribed'] {
    return useSelector<AppState, AppState['fundraising']['isSubscribed']>(state => state.fundraising.isSubscribed)    
}

export function useUserFunded(): AppState['fundraising']['isFunded'] {
  return useSelector<AppState, AppState['fundraising']['isFunded']>(state => state.fundraising.isFunded)    
}

export function useProgressPhase(): AppState['fundraising']['progressPhase'] {
    return useSelector<AppState, AppState['fundraising']['progressPhase']>(state => state.fundraising.progressPhase)    
}

export function useMaxAlloc(): AppState['fundraising']['maxAlloc'] {
  return useSelector<AppState, AppState['fundraising']['maxAlloc']>(state => state.fundraising.maxAlloc)    
}

export function extractContractPoolInfo(poolInfo:any):any {  
  let poolinfo:any = {rewardToken: poolInfo['rewardToken'],fundRaisingToken: poolInfo['fundRaisingToken'], 
                    subscriptionStartTimestamp: poolInfo['subscriptionStartTimestamp'], 
                    subscriptionEndTimestamp: poolInfo['subscriptionEndTimestamp'], 
                    fundingEndTimestamp: poolInfo['fundingEndTimestamp'], targetRaise: poolInfo['targetRaise'], 
                    price: poolInfo['price'], maxStakingAmountPerUser: poolInfo['maxStakingAmountPerUser'], 
                    maxUtilityNFTsValue: poolInfo['maxUtilityNFTsValue'], rewardsStartTime: poolInfo['rewardsStartTime'], 
                    rewardsCliffEndTime: poolInfo['rewardsCliffEndTime'], rewardsEndTime: poolInfo['rewardsEndTime']}                        
  return poolinfo               
}

export function extractContractUserInfo(userInfo:any):any {  
  let userinfo:any = {amount: userInfo['amount'],fundingAmount: userInfo['fundingAmount'], 
                    multiplier: userInfo['multiplier'], nftValue: userInfo['nftValue'], 
                    utilityNFTTokenId: userInfo['utilityNFTTokenId'], collectedRewards: userInfo['collectedRewards']}                      
  return userinfo               
}

// export function useFetchPoolInfo(fundRaisingContract: Contract | null, pid: number) {
//     const dispatch = useDispatch<AppDispatch>()
//     const { account } = useActiveWeb3React()
//     useEffect(() => {
//       const fetchData = async () => {
//         if (fundRaisingContract){                        
//           let numsOfPools=await fundRaisingContract.numberOfPools()
//           if (!numsOfPools || pid>=numsOfPools) return null
//           let poolInfo=await fundRaisingContract.poolInfo(pid)      
//           dispatch(setPoolID({poolID:pid}))         
//           dispatch(setPoolInfo({poolInfo:extractContractPoolInfo(poolInfo)}))               
//         }
//         return null
//       }         
//       if (account && pid>=0){   
//         dispatch(setPoolInfo({poolInfo:null}))       
//         fetchData()      
//       }
//     }, [dispatch, account, pid])    
// }
  
// export function useFetchUserInfo(fundRaisingContract: Contract | null, pid: number) {
//     const { account } = useActiveWeb3React()
//     const dispatch = useDispatch<AppDispatch>()    
//     useEffect(() => {
//       const fetchData = async () => {
//         if (fundRaisingContract){                  
//           let numsOfPools=await fundRaisingContract.numberOfPools()
//           if (!numsOfPools || pid>=numsOfPools) return null
//           let userInfo=await fundRaisingContract.userInfo(pid, account)
//           dispatch(setUserInfo({userInfo:extractContractUserInfo(userInfo)}))
//           const claim = kycMerkleRoot.kycRecords[account?account:ZERO_ADDRESS];     
//           if (claim) dispatch(setIsKYCed({isKYCed:true}))
//           else dispatch(setIsKYCed({isKYCed:false}))
//           if (userInfo){
//             if (userInfo['multiplier']>0) dispatch(setIsSubscribed({isSubscribed:true}))
//             else dispatch(setIsSubscribed({isSubscribed:false}))
//           }
//         }
//         return null
//       }          
//       if (account && pid>=0){   
//         dispatch(setUserInfo({userInfo:null}))
//         fetchData()      
//       }
//     }, [dispatch, account, pid])        
// }

export function getProgressPhase(poolInfo:any, blockTimestamp:BigNumber | undefined):any {    
  let progressPhase=0
  let remainTime=0
  let loadedTimestamp=false
  if (poolInfo && blockTimestamp){         
    if (poolInfo['subscriptionStartTimestamp'].toNumber()>0){
      if (blockTimestamp?.lt(poolInfo['subscriptionStartTimestamp'])){ // subscription not started
        progressPhase=0 
        remainTime=poolInfo['subscriptionStartTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    if (poolInfo['subscriptionStartTimestamp'].toNumber()>0 && poolInfo['subscriptionEndTimestamp'].toNumber()>0){
      if (blockTimestamp?.gte(poolInfo['subscriptionStartTimestamp']) && blockTimestamp?.lt(poolInfo['subscriptionEndTimestamp'])){ // subscription started
        progressPhase=1
        remainTime=poolInfo['subscriptionEndTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    if (poolInfo['subscriptionEndTimestamp'].toNumber()>0 && poolInfo['fundingEndTimestamp'].toNumber()>0){
      if (blockTimestamp?.gte(poolInfo['subscriptionEndTimestamp']) && blockTimestamp?.lt(poolInfo['fundingEndTimestamp'])){ // fundSubscription started
        progressPhase=2
        remainTime=poolInfo['fundingEndTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    if (poolInfo['fundingEndTimestamp'].toNumber()>0 && poolInfo['rewardsStartTime'].toNumber()>0){
      if (blockTimestamp?.gte(poolInfo['fundingEndTimestamp']) && blockTimestamp?.lt(poolInfo['rewardsStartTime'])){ // Deadline has passed to fund your subscription
        progressPhase=3    
        remainTime=0
      }
    }
    if (poolInfo['rewardsStartTime'].toNumber()>0){
      if (blockTimestamp?.gte(poolInfo['rewardsStartTime'])){ // distribution started
        progressPhase=4
        remainTime=poolInfo['rewardsEndTime'].sub(blockTimestamp).toNumber()
      }
    }
    loadedTimestamp=true
  }
  return {progressPhase:progressPhase, remainSecs:remainTime, loaded:loadedTimestamp}
}