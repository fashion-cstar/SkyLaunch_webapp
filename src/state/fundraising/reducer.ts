import { createReducer } from '@reduxjs/toolkit'
import { BigNumber } from '@ethersproject/bignumber'

import {
  PoolInfo,
  UserInfo,
  setPoolInfo,
  setUserInfo,
  setIsKYCed,
  setIsSubscribed,
  setIsFunded,
  setProgressPhase,
  setPoolID,
  setMaxAlloc,
  // setUserId,
  // setJwtToken,
  // setSignedAccount,
  setIsLogging,
  setIsFormSent,
  setIsClaimedNFT
} from './actions'

export interface FundRaisingState {
  poolInfo: PoolInfo | null | undefined
  userInfo: UserInfo | null | undefined
  isKYCed: boolean
  isSubscribed: boolean
  isFunded: boolean
  progressPhase: number
  poolID: number
  maxAlloc: number
  isLogging: boolean
  isFormSent: boolean
  isClaimedNFT: boolean
}

const initialState: FundRaisingState = {
  poolInfo: null,
  userInfo: null,
  isKYCed: false,
  isSubscribed: false,
  isFunded: false,
  progressPhase: 0,
  poolID: 0,
  maxAlloc: 0,
  // userId: '',
  // JwtToken: '',
  // signedAccount: '',
  isLogging: false,
  isFormSent: false,
  isClaimedNFT: false
}

export default createReducer<FundRaisingState>(initialState, builder =>
  builder
    .addCase(setPoolInfo, (state, { payload: { poolInfo } }) => {
      return {
        ...state,
        poolInfo
      }
    })
    .addCase(setUserInfo, (state, { payload: { userInfo } }) => {
      return {
        ...state,
        userInfo
      }
    })
    .addCase(setIsKYCed, (state, { payload: { isKYCed } }) => {
      return {
        ...state,
        isKYCed
      }
    })
    .addCase(setIsSubscribed, (state, { payload: { isSubscribed } }) => {
      return {
        ...state,
        isSubscribed
      }
    })
    .addCase(setIsFunded, (state, { payload: { isFunded } }) => {
      return {
        ...state,
        isFunded
      }
    })
    .addCase(setProgressPhase, (state, { payload: { progressPhase } }) => {
      return {
        ...state,
        progressPhase
      }
    })
    .addCase(setPoolID, (state, { payload: { poolID } }) => {
      return {
        ...state,
        poolID
      }
    })
    .addCase(setMaxAlloc, (state, { payload: { maxAlloc } }) => {
      return {
        ...state,
        maxAlloc
      }
    })
    .addCase(setIsLogging, (state, { payload: { isLogging } }) => {
      return {
        ...state,
        isLogging
      }
    })
    .addCase(setIsFormSent, (state, { payload: { isFormSent } }) => {
      return {
        ...state,
        isFormSent
      }
    }) 
    .addCase(setIsClaimedNFT, (state, { payload: { isClaimedNFT } }) => {
      return {
        ...state,
        isClaimedNFT
      }
    })
)
