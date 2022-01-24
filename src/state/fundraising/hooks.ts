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

// returns the claim for the given address, or null if not valid
export function fetchKYClist(): Promise<any | null> {
  return (fetch(`https://raw.githubusercontent.com/SkyLaunchFinance/kyc-merkle/master/kyc-addresses.json`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          console.debug(`Failed to get kyc-addresses`)
          return null
        }
      })
      .catch(error => {
        console.error('Failed to get kyc-addresses', error)
      }))
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
    // subscription not started     
    if (poolInfo['subscriptionStartTimestamp'].gt(0)){
      if (blockTimestamp?.lt(poolInfo['subscriptionStartTimestamp'])){ 
        progressPhase=0 
        remainTime=poolInfo['subscriptionStartTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    // subscription started
    if (poolInfo['subscriptionStartTimestamp'].gt(0) && poolInfo['subscriptionEndTimestamp'].gt(0)){
      if (blockTimestamp?.gte(poolInfo['subscriptionStartTimestamp']) && blockTimestamp?.lt(poolInfo['subscriptionEndTimestamp'])){ // subscription started
        progressPhase=1
        remainTime=poolInfo['subscriptionEndTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    // funding started
    if (poolInfo['subscriptionEndTimestamp'].gt(0) && poolInfo['fundingEndTimestamp'].gt(0)){
      if (blockTimestamp?.gte(poolInfo['subscriptionEndTimestamp']) && blockTimestamp?.lt(poolInfo['fundingEndTimestamp'])){ // fundSubscription started
        progressPhase=2
        remainTime=poolInfo['fundingEndTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    //funding ended
    if (poolInfo['fundingEndTimestamp'].gt(0)){
      if (blockTimestamp?.gte(poolInfo['fundingEndTimestamp']) && blockTimestamp?.lt(poolInfo['rewardsStartTime'])){ // Deadline has passed to fund your subscription
        progressPhase=3    
        remainTime=poolInfo['rewardsStartTime'].sub(blockTimestamp).toNumber()
      }
      if (blockTimestamp?.gte(poolInfo['fundingEndTimestamp']) && poolInfo['rewardsStartTime'].eq(0)){ // Deadline has passed to fund your subscription
        progressPhase=3    
        remainTime=0
      }
    }
    
    if (poolInfo['rewardsStartTime'].gt(0) && poolInfo['rewardsCliffEndTime'].gt(0) && poolInfo['rewardsEndTime'].gt(0)){
      // distribution started but not pass cliff
      if (blockTimestamp?.gte(poolInfo['rewardsStartTime']) && blockTimestamp?.lt(poolInfo['rewardsCliffEndTime']) &&  blockTimestamp?.lt(poolInfo['rewardsEndTime'])){ 
        progressPhase=4
        remainTime=poolInfo['rewardsEndTime'].sub(blockTimestamp).toNumber()
      }
      // distribution started and pass cliff
      if (blockTimestamp?.gte(poolInfo['rewardsCliffEndTime']) &&  blockTimestamp?.lt(poolInfo['rewardsEndTime'])){ 
        progressPhase=5
        remainTime=poolInfo['rewardsEndTime'].sub(blockTimestamp).toNumber()
      }
      // distribution ended
      if (blockTimestamp?.gte(poolInfo['rewardsEndTime'])){ 
        progressPhase=6
        remainTime=0
      }
    }
    loadedTimestamp=true
  }
  return {progressPhase:progressPhase, remainSecs:remainTime, loaded:loadedTimestamp}
}