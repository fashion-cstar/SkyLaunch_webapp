import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { PoolInfo, UserInfo, setPoolInfo, setUserInfo, setIsKYCed, setIsSubscribed, setProgressPhase, setPoolID } from './actions'
import kycMerkleRoot from '../../constants/abis/kycMerkleRoot.json';
import { NATIVE_TOKEN, ZERO_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFundRaisingContract, useTokenContract, useSkyNFTContract } from '../../hooks/useContract'
import { Token } from '@skylaunch/sdk'
import { getContract } from '../../utils'
import ERC20_ABI from 'constants/abis/erc20.json'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { calculateGasMargin } from '../../utils'
import { ChainId } from '@skylaunch/sdk'
import toCurrencyAmount from 'utils/toCurrencyAmount'
import toEtherAmount from 'utils/toEtherAmount'
import { MaxUint256 } from '@ethersproject/constants'

// export function usePoolInfoData(): AppState['fundraising']['poolInfo'] {
//     return useSelector<AppState, AppState['fundraising']['poolInfo']>(state => state.fundraising.poolInfo)    
// }

// export function useUserInfoData(): AppState['fundraising']['userInfo'] {
//     return useSelector<AppState, AppState['fundraising']['userInfo']>(state => state.fundraising.userInfo)    
// }

// export function useUserKYCed(): AppState['fundraising']['isKYCed'] {
//     return useSelector<AppState, AppState['fundraising']['isKYCed']>(state => state.fundraising.isKYCed)    
// }

// export function useUserSubscribed(): AppState['fundraising']['isSubscribed'] {
//     return useSelector<AppState, AppState['fundraising']['isSubscribed']>(state => state.fundraising.isSubscribed)    
// }

// export function useUserFunded(): AppState['fundraising']['isFunded'] {
//   return useSelector<AppState, AppState['fundraising']['isFunded']>(state => state.fundraising.isFunded)    
// }

// export function useProgressPhase(): AppState['fundraising']['progressPhase'] {
//     return useSelector<AppState, AppState['fundraising']['progressPhase']>(state => state.fundraising.progressPhase)    
// }

// export function useMaxAlloc(): AppState['fundraising']['maxAlloc'] {
//   return useSelector<AppState, AppState['fundraising']['maxAlloc']>(state => state.fundraising.maxAlloc)    
// }

export function useFundRaisingCallback()
: {
  poolInfoCallback: (pid: number) => Promise<PoolInfo | undefined>,
  userInfoCallback: (pid: number) => Promise<UserInfo | undefined>,
  countsOfPoolCallback: () => Promise<number>
} {
  // get claim data for this account
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()

  const poolInfoCallback = useCallback(async function(pid: number){
    if (!fundRaisingContract || !account || pid<0) return
    return fundRaisingContract.poolInfo(pid).then((poolInfo:any) => {      
      return extractContractPoolInfo(poolInfo)
    }).catch((error:any) => {
      console.debug(`Failed to poolInfo from fundRaising Contract`, error)
      return
    })
  }, [account, chainId])

  const userInfoCallback = useCallback(async function(pid: number){
    if (!fundRaisingContract || !account || pid<0) return
    return fundRaisingContract.userInfo(pid, account).then((userInfo:any) => {      
      return extractContractUserInfo(userInfo)
    }).catch((error:any) => {
      console.debug(`Failed to userInfo from fundRaising Contract`, error)
      return
    })
  }, [account, chainId])
  
  const countsOfPoolCallback = async function(){    
    if (!fundRaisingContract) return
    let numsOfPools=await fundRaisingContract.numberOfPools()
    return numsOfPools
  }

  return { poolInfoCallback, userInfoCallback, countsOfPoolCallback }
}

export function useMaximumAllocation():{maxAllocCallback: (pid: number) => Promise<BigNumber | undefined>} {
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const maxAllocCallback = async function(pid: number){
    if (!fundRaisingContract || !account || pid<0) return
    return fundRaisingContract.getMaximumAllocation(pid).then((res:BigNumber) => {
      return res
    }).catch((error:any) => {
      console.debug(`Failed to get maxAllocation from fundRaising Contract`, error)
      return
    })
  }
  return { maxAllocCallback }
}

export function useTotalReward(account: string | null | undefined):{totalRewardCallback: (pid: number) => Promise<BigNumber | undefined>} {
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const totalRewardCallback = async function(pid: number){
    if (!fundRaisingContract || !account || pid<0) return
    return fundRaisingContract.getTotalReward(pid, account).then((res:BigNumber) => {
      return res
    }).catch((error:any) => {
      console.debug(`Failed to get total reward from fundRaising Contract`, error)
      return
    })
  }
  return { totalRewardCallback }
}

export function useUtilityNFTTokenId(account: string | null | undefined):{NFTTokenIdCallback: () => Promise<number | undefined>} {
  const { library, chainId } = useActiveWeb3React()
  const testNFTContract = useSkyNFTContract()
  const NFTTokenIdCallback = async function(){
    if (!testNFTContract || !account) return        
    return testNFTContract.tokenOfOwnerByIndex(account,0).then((tokenId:BigNumber) => {      
      return tokenId.toNumber()
    }).catch((error:any) => {
      console.debug(`Failed to get NFTTokenId from NFTToken Contract`, error)
      return
    })
  }
  return { NFTTokenIdCallback }
}

export function useFundAndRewardToken(account: string | null | undefined):{
  fundTokenCallback: (tokenAddress: string) => Promise<Token | undefined>,
  rewardTokenCallback: (tokenAddress: string) => Promise<Token | undefined>
} {
  const { library, chainId } = useActiveWeb3React()
  const fundTokenCallback = async function(tokenAddress: string){
    if (!account || !tokenAddress || !library || !chainId) return
    if (tokenAddress===ZERO_ADDRESS){      
      return NATIVE_TOKEN[chainId]
    }
    let fundTokenContract:Contract=getContract(tokenAddress, ERC20_ABI, library, account ? account : undefined)  
    let name=await fundTokenContract.name()
    let symbol=await fundTokenContract.symbol()
    let decimals=await fundTokenContract.decimals()
    return new Token(chainId, tokenAddress, decimals, symbol, name)
  }
  const rewardTokenCallback = async function(tokenAddress: string){
    if (!account || !tokenAddress || !library || !chainId) return
    let rewardTokenContract:Contract=getContract(tokenAddress, ERC20_ABI, library, account ? account : undefined)  
    let name=await rewardTokenContract.name()
    let symbol=await rewardTokenContract.symbol()
    let decimals=await rewardTokenContract.decimals()
    return new Token(chainId, tokenAddress, decimals, symbol, name)
  }
  return { fundTokenCallback, rewardTokenCallback }
}

export function useSubscribeCallback(
  account: string | null | undefined
): {
  subscribeCallback: (pid: number, claim: any) => Promise<string>,
  subscribeWithNFTCallback: (pid: number, claim: any, NFTTokenId: number) => Promise<string>
} {
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()

  const subscribeCallback = async function(pid: number, claim: any) {
    if (!account || !library || !chainId || !fundRaisingContract) return

    return fundRaisingContract.estimateGas.subscribe(pid, claim.index, claim.proof).then(estimatedGasLimit => {
      const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
      return fundRaisingContract
        .subscribe(pid, claim.index, claim.proof, { gasLimit: calculateGasMargin(gas) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Subscribing`
          })          
          return response.hash
        })
    })
  }

  const subscribeWithNFTCallback = async function(pid: number, claim: any, NFTTokenId:number) {
    if (!account || !library || !chainId || !fundRaisingContract || NFTTokenId<0) return

    return fundRaisingContract.estimateGas.subscribeWithUtilityNFT(pid, NFTTokenId, claim.index, claim.proof).then(estimatedGasLimit => {
      const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
      return fundRaisingContract
        .subscribeWithUtilityNFT(pid, NFTTokenId, claim.index, claim.proof, { gasLimit: calculateGasMargin(gas) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Subscribing`
          })          
          return response.hash
        })
    })
  }

  return { subscribeCallback, subscribeWithNFTCallback }
}

export function useClaimCallback(
  account: string | null | undefined
): {
  claimCallback: (pid: number, symbol: string | undefined) => Promise<string>,
  pendingCallback: (pid: number) => Promise<BigNumber>
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()  

  const pendingCallback = async function(pid: number) {
    if (!account || !library || !chainId || !fundRaisingContract) return    
    
    return fundRaisingContract.pendingRewards(pid, account).then ( (pending:BigNumber)  => {
      return pending
    }).catch((error:any) => {
      return
    })
  }
  
  const claimCallback = async function(pid: number, symbol: string | undefined) {
    if (!account || !library || !chainId || !fundRaisingContract) return    

    return fundRaisingContract.claimReward(pid,{ gasLimit: 350000 })
    .then((response: TransactionResponse) => {
      addTransaction(response, {
          summary: `Claim accumulated ${symbol || ''} rewards`
      })
      return response.hash          
    })
    .catch((error: any) => {
      return
    })    
  }
  return { claimCallback, pendingCallback }
}

export function useFundApproveCallback(
  account: string | null | undefined
): {fundApproveCallback: (pid: number, fundToken: Token, amount: number) => Promise<string>
} {
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()  
  const fundApproveCallback = async function(pid: number, fundToken: Token, amount: number) {
    if (!account || !library || !chainId || !fundRaisingContract || !fundToken) return
    const tokenContract:Contract=getContract(fundToken?.address, ERC20_ABI, library, account ? account : undefined)
    return tokenContract.estimateGas.approve(fundRaisingContract.address, MaxUint256).then(estimatedGas => {
      return tokenContract.estimateGas.approve(fundRaisingContract.address, toCurrencyAmount(amount, fundToken?.decimals)).then(estimatedGasLimit => {
        const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
        return tokenContract.approve(fundRaisingContract.address, toCurrencyAmount(amount, fundToken?.decimals), {
          gasLimit: calculateGasMargin(gas)
          }).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: 'Approve ' + fundToken?.symbol,
              approval: { tokenAddress: fundToken?.address, spender: fundRaisingContract.address }
            })       
            return response.hash
        }).catch((error: any) => {
          return
        })
      }).catch((error: any) => {
        const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas
        return tokenContract.approve(fundRaisingContract.address, MaxUint256, {
          gasLimit: calculateGasMargin(gas)
          }).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: 'Approve ' + fundToken?.symbol,
              approval: { tokenAddress: fundToken?.address, spender: fundRaisingContract.address }
            })       
            return response.hash
        }).catch((error: any) => {
          return
        })        
      })                
    }).catch((error: any) => {
      return
    })
  }
  return { fundApproveCallback }
}
export function useFundItCallback(
  account: string | null | undefined
): {
  fundItCallback: (pid: number, fundToken: Token, amount: number) => Promise<string>
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()  

  const fundItCallback = async function(pid: number, fundToken: Token, amount: number) {
    if (!account || !library || !chainId || !fundRaisingContract || !fundToken) return
    if (fundToken.address===ZERO_ADDRESS){ 
      return fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
        value:toCurrencyAmount(amount, fundToken?.decimals)
      }).then(estimatedGasLimit => {
        const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
        return fundRaisingContract.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
          gasLimit: calculateGasMargin(gas), value:toCurrencyAmount(amount, fundToken?.decimals)
          }).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Funding ${amount} ${fundToken?.symbol}`
            })         
            return response.hash
        }).catch((error: any) => {
          return
        })
      }).catch((error: any) => {
        return
      })
    }else{
      return fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals)).then(estimatedGas => {
        return fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals)).then(estimatedGasLimit => {
          const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
          return fundRaisingContract.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
            gasLimit: calculateGasMargin(gas)
            }).then((response: TransactionResponse) => {
              addTransaction(response, {
                summary: `Funding ${amount} ${fundToken?.symbol}`
              })        
              return response.hash
          }).catch((error: any) => {
            return
          })
        }).catch((error: any) => {
          return
        })                
      }).catch((error: any) => {
        return
      })
    }
  }

  return { fundItCallback }
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