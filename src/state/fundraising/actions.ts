import { createAction } from '@reduxjs/toolkit'
import { Token } from '@skylaunch/sdk'
import { BigNumber } from '@ethersproject/bignumber'

export type PoolInfo = {  
    rewardToken: string
    fundRaisingToken: string
    subscriptionStartTimestamp: BigNumber
    subscriptionEndTimestamp: BigNumber
    fundingEndTimestamp: BigNumber
    targetRaise: BigNumber
    price: BigNumber
    maxStakingAmountPerUser: BigNumber
    maxUtilityNFTsValue: BigNumber
    rewardsStartTime: BigNumber
    rewardsCliffEndTime: BigNumber
    rewardsEndTime: BigNumber   
}

export type UserInfo = {      
    amount: BigNumber
    fundingAmount: BigNumber
    multiplier: BigNumber
    nftValue: BigNumber
    utilityNFTTokenId: BigNumber
    collectedRewards: BigNumber
}

export const setPoolInfo = createAction<{ poolInfo: PoolInfo | null }>('fundraising/setPoolInfo')
export const setUserInfo = createAction<{ userInfo: UserInfo | null }>('fundraising/setUserInfo')
export const setIsKYCed = createAction<{ isKYCed: boolean }>('fundraising/setIsKYCed')
export const setIsSubscribed = createAction<{ isSubscribed: boolean }>('fundraising/setIsSubscribed')
export const setIsFunded = createAction<{ isFunded: boolean }>('fundraising/setIsFunded')
export const setProgressPhase = createAction<{ progressPhase: number }>('fundraising/setProgressPhase')
export const setPoolID = createAction<{ poolID: number }>('fundraising/setPoolID')
export const setMaxAlloc = createAction<{ maxAlloc: number }>('fundraising/setMaxAlloc')
// export const setRemainSecs = createAction<{ remainSecs: number }>('fundraising/setRemainSecs')
export const setUserId = createAction<{ userId: string }>('fundraising/setUserId')
export const setJwtToken = createAction<{ JwtToken: string }>('fundraising/setJwtToken')
export const setSignedAccount = createAction<{ signedAccount: string }>('fundraising/setSignedAccount')
export const setIsLogging = createAction<{ isLogging: boolean }>('fundraising/setIsLogging')
export const setIsFormSent = createAction<{ isFormSent: boolean }>('fundraising/setIsFormSent')