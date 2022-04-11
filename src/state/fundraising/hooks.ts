import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, AppState } from '../index'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { PoolInfo, UserInfo, setPoolInfo, setUserInfo, setIsKYCed, setIsSubscribed, setProgressPhase, setPoolID } from './actions'
import kycMerkleRoot from '../../constants/abis/kycMerkleRoot.json';
import { NATIVE_TOKEN, ZERO_ADDRESS } from '../../constants'
import { useActiveWeb3React } from '../../hooks'
import useRefresh from '../../hooks/useRefresh'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useFundRaisingContract, useTokenContract, useSkyNFTContract } from '../../hooks/useContract'
import { Token } from '@skylaunch/sdk'
import { getContract } from '../../utils'
import ERC20_ABI from 'constants/abis/erc20.json'
import { useTransactionAdder } from 'state/transactions/hooks'
import { TransactionResponse } from '@ethersproject/providers'
import { calculateGasMargin } from '../../utils'
import { ChainId } from '@skylaunch/sdk'
import parseEther from 'utils/parseEther'
import formatEther from 'utils/formatEther'
import { MaxUint256 } from '@ethersproject/constants'
import Web3 from 'web3'
import { useAddPopup } from 'state/application/hooks'
import { setIsClaimedNFT } from 'state/fundraising/actions'

export function useIsLogging(): AppState['fundraising']['isLogging'] {
  return useSelector<AppState, AppState['fundraising']['isLogging']>(state => state.fundraising.isLogging)
}

export function useIsFormSent(): AppState['fundraising']['isFormSent'] {
  return useSelector<AppState, AppState['fundraising']['isFormSent']>(state => state.fundraising.isFormSent)
}

export function useIsClaimedNFT(): AppState['fundraising']['isClaimedNFT'] {
  return useSelector<AppState, AppState['fundraising']['isClaimedNFT']>(state => state.fundraising.isClaimedNFT)
}

export function useAddTxRevertedToast(): { addTxRevertedToast: (message: string) => void } {
  const addPopup = useAddPopup()
  const addTxRevertedToast = function (message: string) {
    let popcontent: any = {
      txReverted: {
        message: message
      }
    }
    const now = new Date();
    const unixTime = Math.round(now.getTime())
    addPopup(
      popcontent,
      unixTime.toString()
    )
  }

  return { addTxRevertedToast }
}

export function usePoolAndUserInfoCallback()
  : {
    poolInfoCallback: (pid: number) => Promise<PoolInfo | undefined>,
    userInfoCallback: (pid: number) => Promise<UserInfo | undefined>,
    countsOfPoolCallback: () => Promise<number>
  } {
  // get claim data for this account
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()

  const poolInfoCallback = useCallback(async function (pid: number) {
    if (!fundRaisingContract || !account || pid < 0) return
    return fundRaisingContract.poolInfo(pid).then((poolInfo: any) => {
      return extractContractPoolInfo(poolInfo)
    })
  }, [account, chainId])

  const userInfoCallback = useCallback(async function (pid: number) {
    if (!fundRaisingContract || !account || pid < 0) return
    return fundRaisingContract.userInfo(pid, account).then((userInfo: any) => {
      return extractContractUserInfo(userInfo)
    })
  }, [account, chainId])

  const countsOfPoolCallback = async function () {
    if (!fundRaisingContract) return 0
    return fundRaisingContract.numberOfPools().then((numsOfPools: any) => {
      if (numsOfPools) return numsOfPools.toNumber()
      else return 0
    })
  }

  return { poolInfoCallback, userInfoCallback, countsOfPoolCallback }
}

export function useIdoDetailFromPool(): { getIdoDetailCallback: (IdoList:any[]) => Promise<any[]> } {
  const { poolInfoCallback, countsOfPoolCallback } = usePoolAndUserInfoCallback()  
  const getIdoDetailCallback = async function (IdoList: any[]) {
    let list:any[]=[]
    let countsOfPool = 0
    await countsOfPoolCallback().then(res => {
      countsOfPool = res
    }).catch(error => { countsOfPool=0 })

    await Promise.all(IdoList.map(async item => {
      if (item.pid >= 0 && item.pid < countsOfPool) {
        await poolInfoCallback(item.pid)
          .then((poolInfo: PoolInfo | undefined) => {
            if (poolInfo) {
              let subscriptionStart = new Date(poolInfo.subscriptionStartTimestamp.toNumber() * 1000)
              let fundingEnd = new Date(poolInfo.fundingEndTimestamp.toNumber() * 1000)
              let targetRaise = formatEther(poolInfo.targetRaise, undefined, 2, true)
              let price = formatEther(poolInfo.price, undefined, 4, false)
              let temp = poolInfo.targetRaise.div(poolInfo.price)
              let amount = temp.toNumber()
              let tokenAmount="0"
              if (amount >= 1000000) {
                tokenAmount=(Math.round(amount/10000)/100).toString()+'M'
              } else if (amount >= 1000) {
                tokenAmount=(Math.round(amount/10000)/100).toString()+'K'
              }
              list.push({ ...item, launchDate: subscriptionStart, endDate: fundingEnd, targetRaise: targetRaise, totalAmount: tokenAmount, IdoPrice: price })
            }
          })
          .catch(error => { })
      }
    }))
    return list
  }

  return { getIdoDetailCallback }
}

export function useMaxAllocCallback(): { maxAllocCallback: (pid: number) => Promise<BigNumber | undefined> } {
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const maxAllocCallback = async function (pid: number) {
    if (!fundRaisingContract || !account || pid < 0) return BigNumber.from(0)
    return fundRaisingContract.getMaximumAllocation(pid).then((res: BigNumber) => {
      return res
    })
  }
  return { maxAllocCallback }
}

export function useNFTDropClaimCallback(
  account: string | null | undefined
): {
  NFTDropClaimCallback: (NFTAllocation: number) => Promise<TransactionResponse>,
} {
  const { library, chainId } = useActiveWeb3React()
  const skyNFTContract = useSkyNFTContract()
  const addTransaction = useTransactionAdder()

  const NFTDropClaimCallback = async function (NFTAllocation: number) {
    if (!account || !library || !chainId || !skyNFTContract) return

    return skyNFTContract.estimateGas.mint(account, parseEther(NFTAllocation.toString(), 18)).then(estimatedGasLimit => {
      const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
      return skyNFTContract
        .mint(account, parseEther(NFTAllocation.toString(), 18), { gasLimit: calculateGasMargin(gas) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `NFT Drop Claiming`
          })
          return response
        })
    })
  }
  return { NFTDropClaimCallback }
}

export function useUserMultiplier(): BigNumber {
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const [userMultiplier, setUserMultiplier] = useState(BigNumber.from(0))
  useEffect(() => {
    const fetchUserMultiplier = async () => {
      if (fundRaisingContract) {
        let res = await fundRaisingContract.getMultiplier(account)  
        return res
      }
    }
    if (account && fundRaisingContract) {
      fetchUserMultiplier().then(result => {
        setUserMultiplier(result)
      }).catch(console.error)
    }
  }, [account, fundRaisingContract])

  return userMultiplier
}

export function usePendingRewards(pid: number): BigNumber {
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const [pending, setPending] = useState(BigNumber.from(0))
  const { slowRefresh, fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchUserPending = async () => {
      if (fundRaisingContract) {
        let res = await fundRaisingContract.pendingRewards(pid, account)
        return res
      }
    }
    if (account && fundRaisingContract) {
      fetchUserPending().then(result => {
        setPending(result)
      }).catch(error => {})
    } else {
      setPending(BigNumber.from(0))
    }
  }, [account, fundRaisingContract, slowRefresh])

  return pending
}

export function useTokenAllowanceCallback(): { tokenAllowanceCallback: (owner: string, spender: string | undefined, tokenContractAddress: string) => Promise<BigNumber> } {
  const { account, library } = useActiveWeb3React()
  const tokenAllowanceCallback = async function (owner: string, spender: string | undefined, tokenContractAddress: string) {
    if (!account || !library || !tokenContractAddress && !spender) return BigNumber.from(0)
    const tokenContract: Contract = getContract(tokenContractAddress, ERC20_ABI, library, account ? account : undefined)
    return tokenContract.allowance(owner, spender).then((res: BigNumber) => {
      return res
    })
  }
  return { tokenAllowanceCallback }
}

export function useTotalRewardCallback(account: string | null | undefined): { totalRewardCallback: (pid: number) => Promise<BigNumber | undefined> } {
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const totalRewardCallback = async function (pid: number) {
    if (!fundRaisingContract || !account || pid < 0) return BigNumber.from(0)
    return fundRaisingContract.getTotalReward(pid, account).then((res: BigNumber) => {
      return res
    })
  }
  return { totalRewardCallback }
}

export function useTotalRewards(pid: number): BigNumber {
  const { account, library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const [totalRewards, setTotalRewards] = useState(BigNumber.from(0))

  useEffect(() => {
    const fetchTotalRewards = async () => {
      if (fundRaisingContract) {
        let res = await fundRaisingContract.getTotalReward(pid, account)
        return res
      }
    }
    if (account && fundRaisingContract) {
      fetchTotalRewards().then(result => {
        setTotalRewards(result)
      }).catch(console.error)
    } else {
      setTotalRewards(BigNumber.from(0))
    }
  }, [account, fundRaisingContract])

  return totalRewards
}

export function useNFTOwnerByIndex(isOpen: boolean): number {
  const { account, library, chainId } = useActiveWeb3React()
  const testNFTContract = useSkyNFTContract()
  const [tokenId, setTokenId] = useState(-1)
  const { slowRefresh, middleRefresh, fastRefresh } = useRefresh()
  const isClaimedNFT = useIsClaimedNFT()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const fetchNFTOwnerByIndex = async () => {
      if (testNFTContract) {
        let res = await testNFTContract.tokenOfOwnerByIndex(account, 0)
        return res
      }
    }
    if (account && testNFTContract) {
      fetchNFTOwnerByIndex().then(result => {
        if (result){
          setTokenId(result.toNumber())
          dispatch(setIsClaimedNFT({ isClaimedNFT: false }))
        }else{
          setTokenId(-1)
        }
      }).catch(error => { })
    } else {
      setTokenId(-1)
    }
  }, [account, testNFTContract, isClaimedNFT, isOpen])

  return tokenId
}

export function useNFTOwnerByIndexCallback(account: string | null | undefined): { NFTOwnerByIndexCallback: () => Promise<BigNumber | undefined> } {
  const { library, chainId } = useActiveWeb3React()
  const testNFTContract = useSkyNFTContract()
  const NFTOwnerByIndexCallback = async function () {
    if (!testNFTContract || !account) return
    return testNFTContract.tokenOfOwnerByIndex(account, 0).then((tokenId: BigNumber) => {
      return tokenId
    }).catch((error: any)=> {})
  }
  return { NFTOwnerByIndexCallback }
}

export function useFundAndRewardTokenCallback(account: string | null | undefined): {
  fundTokenCallback: (tokenAddress: string) => Promise<Token | undefined>,
  rewardTokenCallback: (tokenAddress: string) => Promise<Token | undefined>
} {
  const { library, chainId } = useActiveWeb3React()
  const fundTokenCallback = async function (tokenAddress: string) {
    if (!account || !tokenAddress || !library || !chainId) return
    if (tokenAddress === ZERO_ADDRESS) {
      return NATIVE_TOKEN[chainId]
    }
    let fundTokenContract: Contract = getContract(tokenAddress, ERC20_ABI, library, account ? account : undefined)
    let name = await fundTokenContract.name()
    let symbol = await fundTokenContract.symbol()
    let decimals = await fundTokenContract.decimals()
    return new Token(chainId, tokenAddress, decimals, symbol, name)
  }
  const rewardTokenCallback = async function (tokenAddress: string) {
    if (!account || !tokenAddress || !library || !chainId) return
    let rewardTokenContract: Contract = getContract(tokenAddress, ERC20_ABI, library, account ? account : undefined)
    let name = await rewardTokenContract.name()
    let symbol = await rewardTokenContract.symbol()
    let decimals = await rewardTokenContract.decimals()
    return new Token(chainId, tokenAddress, decimals, symbol, name)
  }
  return { fundTokenCallback, rewardTokenCallback }
}

export function useSubscribeCallback(
  account: string | null | undefined
): {
  subscribeCallback: (pid: number, claim: any) => Promise<TransactionResponse>,
  subscribeWithNFTCallback: (pid: number, claim: any, NFTTokenId: number) => Promise<TransactionResponse>
} {
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()

  const subscribeCallback = async function (pid: number, claim: any) {
    if (!account || !library || !chainId || !fundRaisingContract) return

    return fundRaisingContract.estimateGas.subscribe(pid, claim.index, claim.proof).then(estimatedGasLimit => {
      const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
      return fundRaisingContract
        .subscribe(pid, claim.index, claim.proof, { gasLimit: calculateGasMargin(gas) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Subscribing`
          })
          return response
        })
    })
  }

  const subscribeWithNFTCallback = async function (pid: number, claim: any, NFTTokenId: number) {
    if (!account || !library || !chainId || !fundRaisingContract || NFTTokenId < 0) return

    return fundRaisingContract.estimateGas.subscribeWithUtilityNFT(pid, NFTTokenId, claim.index, claim.proof).then(estimatedGasLimit => {
      const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
      return fundRaisingContract
        .subscribeWithUtilityNFT(pid, NFTTokenId, claim.index, claim.proof, { gasLimit: calculateGasMargin(gas) })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Subscribing`
          })
          return response
        })
    })
  }

  return { subscribeCallback, subscribeWithNFTCallback }
}

export function useClaimCallback(
  account: string | null | undefined
): {
  claimCallback: (pid: number, symbol: string | undefined) => Promise<TransactionResponse>,
  pendingCallback: (pid: number) => Promise<BigNumber>
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()

  const pendingCallback = async function (pid: number) {
    if (!account || !library || !chainId || !fundRaisingContract) return

    return fundRaisingContract.pendingRewards(pid, account).then((pending: BigNumber) => {
      return pending
    })
  }

  const claimCallback = async function (pid: number, symbol: string | undefined) {
    if (!account || !library || !chainId || !fundRaisingContract) return

    return fundRaisingContract.claimReward(pid, { gasLimit: 350000 })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: `Claim accumulated ${symbol || ''} rewards`
        })
        return response
      })
  }
  return { claimCallback, pendingCallback }
}

export function useFundApproveCallback(
  account: string | null | undefined
): {
  fundApproveCallback: (pid: number, fundToken: Token, amount: BigNumber) => Promise<TransactionResponse>
} {
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()
  const fundApproveCallback = async function (pid: number, fundToken: Token, amount: BigNumber) {
    if (!account || !library || !chainId || !fundRaisingContract || !fundToken) return
    const tokenContract: Contract = getContract(fundToken?.address, ERC20_ABI, library, account ? account : undefined)
    return tokenContract.estimateGas.approve(fundRaisingContract.address, MaxUint256).then(estimatedGas => {
      return tokenContract.estimateGas.approve(fundRaisingContract.address, amount).then(estimatedGasLimit => {
        const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
        return tokenContract.approve(fundRaisingContract.address, amount, {
          gasLimit: calculateGasMargin(gas)
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: 'Approve ' + fundToken?.symbol,
            approval: { tokenAddress: fundToken?.address, spender: fundRaisingContract.address }
          })
          return response
        })
      })
    })
  }
  return { fundApproveCallback }
}
export function useFundItCallback(
  account: string | null | undefined
): {
  fundItCallback: (pid: number, fundToken: Token, amount: number) => Promise<TransactionResponse>
} {
  // get claim data for this account
  const { library, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const addTransaction = useTransactionAdder()

  const fundItCallback = async function (pid: number, fundToken: Token, amount: number) {
    if (!account || !library || !chainId || !fundRaisingContract || !fundToken) return
    if (fundToken.address === ZERO_ADDRESS) {
      return fundRaisingContract.estimateGas.fundSubscription(pid, parseEther(amount.toString(), fundToken?.decimals), {
        value: parseEther(amount.toString(), fundToken?.decimals)
      }).then(estimatedGasLimit => {
        const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
        return fundRaisingContract.fundSubscription(pid, parseEther(amount.toString(), fundToken?.decimals), {
          gasLimit: calculateGasMargin(gas), value: parseEther(amount.toString(), fundToken?.decimals)
        }).then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Funding ${amount} ${fundToken?.symbol}`
          })
          return response
        })
      })
    } else {
      return fundRaisingContract.estimateGas.fundSubscription(pid, parseEther(amount.toString(), fundToken?.decimals)).then(estimatedGas => {
        return fundRaisingContract.estimateGas.fundSubscription(pid, parseEther(amount.toString(), fundToken?.decimals)).then(estimatedGasLimit => {
          const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGasLimit
          return fundRaisingContract.fundSubscription(pid, parseEther(amount.toString(), fundToken?.decimals), {
            gasLimit: calculateGasMargin(gas)
          }).then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Funding ${amount} ${fundToken?.symbol}`
            })
            return response
          })
        })
      })
    }
  }

  return { fundItCallback }
}

export function extractContractPoolInfo(poolInfo: any): any {
  let poolinfo: any = {
    rewardToken: poolInfo['rewardToken'], fundRaisingToken: poolInfo['fundRaisingToken'],
    subscriptionStartTimestamp: poolInfo['subscriptionStartTimestamp'],
    subscriptionEndTimestamp: poolInfo['subscriptionEndTimestamp'],
    fundingEndTimestamp: poolInfo['fundingEndTimestamp'], targetRaise: poolInfo['targetRaise'],
    price: poolInfo['price'], maxStakingAmountPerUser: poolInfo['maxStakingAmountPerUser'],
    maxUtilityNFTsValue: poolInfo['maxUtilityNFTsValue'], rewardsStartTime: poolInfo['rewardsStartTime'],
    rewardsCliffEndTime: poolInfo['rewardsCliffEndTime'], rewardsEndTime: poolInfo['rewardsEndTime']
  }
  return poolinfo
}

export function extractContractUserInfo(userInfo: any): any {
  let userinfo: any = {
    amount: userInfo['amount'], fundingAmount: userInfo['fundingAmount'],
    multiplier: userInfo['multiplier'], nftValue: userInfo['nftValue'],
    utilityNFTTokenId: userInfo['utilityNFTTokenId'], collectedRewards: userInfo['collectedRewards']
  }
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
      return null
    }))
}

export function useKYCStatus(): { isKYCed: boolean, kyc_addresses: any } {
  const { account, library, chainId } = useActiveWeb3React()
  const [isKYCed, setIsKYCed] = useState(false)
  const [kyc_addresses, setKYCaddresses] = useState<any>()
  
  useEffect(() => {
    if (account) {
      try {
        fetchKYClist().then(res => {
          if (res) setKYCaddresses(res)
          if (res?.kycRecords) {
            const claim = res.kycRecords[account ? account : ZERO_ADDRESS]
            if (claim) setIsKYCed(true)
            else setIsKYCed(false)
          } else {
            setIsKYCed(false)
          }
        })
      } catch (ex) {
        setIsKYCed(false)
      }
    } else {
      setIsKYCed(false)
    }
  }, [account])
  return { isKYCed, kyc_addresses }
}

export function getProgressPhase(poolInfo: any, blockTimestamp: BigNumber | undefined): any {
  let progressPhase = 0
  let remainTime = 0
  let loadedTimestamp = false
  if (poolInfo && blockTimestamp) {
    // subscription not started     
    if (poolInfo['subscriptionStartTimestamp'].gt(0)) {
      if (blockTimestamp?.lt(poolInfo['subscriptionStartTimestamp'])) {
        progressPhase = 0
        remainTime = poolInfo['subscriptionStartTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    // subscription started
    if (poolInfo['subscriptionStartTimestamp'].gt(0) && poolInfo['subscriptionEndTimestamp'].gt(0)) {
      if (blockTimestamp?.gte(poolInfo['subscriptionStartTimestamp']) && blockTimestamp?.lt(poolInfo['subscriptionEndTimestamp'])) { // subscription started
        progressPhase = 1
        remainTime = poolInfo['subscriptionEndTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    // funding started
    if (poolInfo['subscriptionEndTimestamp'].gt(0) && poolInfo['fundingEndTimestamp'].gt(0)) {
      if (blockTimestamp?.gte(poolInfo['subscriptionEndTimestamp']) && blockTimestamp?.lt(poolInfo['fundingEndTimestamp'])) { // fundSubscription started
        progressPhase = 2
        remainTime = poolInfo['fundingEndTimestamp'].sub(blockTimestamp).toNumber()
      }
    }
    //funding ended
    if (poolInfo['fundingEndTimestamp'].gt(0)) {
      if (blockTimestamp?.gte(poolInfo['fundingEndTimestamp']) && blockTimestamp?.lt(poolInfo['rewardsStartTime'])) { // Deadline has passed to fund your subscription
        progressPhase = 3
        remainTime = poolInfo['rewardsStartTime'].sub(blockTimestamp).toNumber()
      }
      if (blockTimestamp?.gte(poolInfo['fundingEndTimestamp']) && poolInfo['rewardsStartTime'].eq(0)) { // Deadline has passed to fund your subscription
        progressPhase = 3
        remainTime = 0
      }
    }

    if (poolInfo['rewardsStartTime'].gt(0) && poolInfo['rewardsCliffEndTime'].gt(0) && poolInfo['rewardsEndTime'].gt(0)) {
      // distribution started but not pass cliff
      if (blockTimestamp?.gte(poolInfo['rewardsStartTime']) && blockTimestamp?.lt(poolInfo['rewardsCliffEndTime']) && blockTimestamp?.lt(poolInfo['rewardsEndTime'])) {
        progressPhase = 4
        remainTime = poolInfo['rewardsEndTime'].sub(blockTimestamp).toNumber()
      }
      // distribution started and pass cliff
      if (blockTimestamp?.gte(poolInfo['rewardsCliffEndTime']) && blockTimestamp?.lt(poolInfo['rewardsEndTime'])) {
        progressPhase = 5
        remainTime = poolInfo['rewardsEndTime'].sub(blockTimestamp).toNumber()
      }
      // distribution ended
      if (blockTimestamp?.gte(poolInfo['rewardsEndTime'])) {
        progressPhase = 6
        remainTime = 0
      }
    }
    loadedTimestamp = true
  }
  return { progressPhase: progressPhase, remainSecs: remainTime, loaded: loadedTimestamp }
}

export function useLoginWithMetaMask(): { fetchLoginWithMetaMask: () => Promise<any> } {
  const fetchLoginWithMetaMask = async function () {
    if (window.ethereum) {
      const timestamp = Date.now()
      if (window.ethereum.request) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider: any = window?.ethereum
        const web3 = new Web3(provider)
        const address = await web3.eth.getCoinbase()
        const message = `Sign this message to prove you have access to this wallet and we will sign you in.
  
      This won't cost you any Ether.
  
      Timestamp: ${timestamp}`;

        return await web3.eth.personal.sign(web3.utils.fromUtf8(message), address, '')
          .then(async (res) => {
            var requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                "timestamp": timestamp,
                "signature": res,
                "address": address
              })
            };
            return await fetch(`https://api.skylaunch.finance/users/login`, requestOptions)
              .then((res) => res)
              .then(async (data) => {
                const reader1: any = data.body?.getReader();
                let signature: any
                while (true) {
                  const { done, value } = await reader1?.read();

                  if (done) {
                    break;
                  }

                  signature = new TextDecoder("utf-8").decode(value);
                }
                const sign = JSON.parse(signature)
                return { ...sign, account: address.toLowerCase() }
              })
              .catch((error) => {
                console.error("Login With Metamask Error: " + error.error?.message)
              });
          })
          .catch((error) => {
            console.error("Login With Metamask Error: " + error.error?.message)
          });
      }
    }
  }

  return { fetchLoginWithMetaMask }
}