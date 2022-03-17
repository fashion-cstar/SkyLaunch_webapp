import { ChainId, CurrencyAmount, JSBI, Pair, Token, TokenAmount, WETH } from '@skylaunch/sdk'
import {
  WAS,
  DAI,
  MOCK1,
  SUSHI,
  UNI,
  USDC,
  USDT,
  WAVAX,
  WBNB,
  WBTC,
  ZERO,
  bscBTC,
  bscBUSD,
  bscDAI,
  bscETH,
  bscINDA,
  bscSUSHI,
  bscUNI,
  bscUSDC,
  bscUSDT,
  bscWBNB,
  bscZERO,
  zBTC,
  zDAI,
  zETH,
  zSUSHI,
  zUNI,
  zUSDC,
  zUSDT,
  zZERO,
  zCHART,
  bscWISB,
  WMATIC,
  MZERO,
  hZERO,
  hINDA,
  XIOT,
  BIOS,
  MINT,
  SKYFI,
  LPTokens
} from '../../constants'
import { NEVER_RELOAD, useMultipleContractSingleData } from '../multicall/hooks'

import { STAKING_REWARDS_INTERFACE } from '../../constants/abis/staking-rewards'
import { tryParseAmount } from '../swap/hooks'
import { useActiveWeb3React } from '../../hooks'
import useCurrentBlockTimestamp from 'hooks/useCurrentBlockTimestamp'
import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import { usePair } from 'data/Reserves'
import { useTotalSupply } from 'data/TotalSupply'

export const STAKING_GENESIS_CHAINS = {
  [ChainId.AVALANCHE]: 1612360800,
  [ChainId.SMART_CHAIN]: 1615597200
}

export const REWARDS_DURATION_DAYS_CHAINS = {
  [ChainId.AVALANCHE]: 60,
  [ChainId.SMART_CHAIN]: 60
}

export const STAKING_GENESIS = 1615597200
export const REWARDS_DURATION_DAYS = 356

// TODO add staking rewards addresses here
export const STAKING_REWARDS_INFO: {
  [chainId in ChainId]?: {
    tokens: [Token, Token]
    stakingRewardAddress: string,
    rewardInfo?: any
  }[]
} = {
  [ChainId.RINKEBY]: [
    {
      tokens: [SKYFI[ChainId.RINKEBY], SKYFI[ChainId.RINKEBY]],
      stakingRewardAddress: '0x46c29ce0CA377AaF01979Eec8610F256a47A2AE2',
      rewardInfo: {
        tradeLink: 'https://app.uniswap.org/#/swap?use=V2&inputCurrency=ETH&outputCurrency=' + SKYFI[ChainId.RINKEBY].address
      }
    },
    {
      tokens: [WETH[ChainId.RINKEBY], SKYFI[ChainId.RINKEBY]],
      stakingRewardAddress: '0x833bf79f4F35eF8c5b2699217E9a5b5380bCa089',
      rewardInfo: {
        tradeLink: 'https://app.uniswap.org/#/swap?use=V2&inputCurrency=ETH&outputCurrency=' + SKYFI[ChainId.RINKEBY].address,
        addLiquidityLink: 'https://app.uniswap.org/#/add/v2/ETH/' + SKYFI[ChainId.RINKEBY].address,
        removeLiquidityLink: 'https://app.uniswap.org/#/remove/v2/ETH/' + SKYFI[ChainId.RINKEBY].address
      },
    },
  ]
}

export interface StakingInfo {
  // the address of the reward contract
  stakingRewardAddress: string
  // the tokens involved in this pair
  tokens: [Token, Token]
  // the amount of token currently staked, or undefined if no account
  stakedAmount: TokenAmount
  // the amount of reward token earned by the active account, or undefined if no account
  earnedAmount: TokenAmount
  // the total amount of token staked in the contract
  totalStakedAmount: TokenAmount
  // the amount of token distributed per second to all LPs, constant
  totalRewardRate: TokenAmount
  // the current amount of token distributed to the active account per second.
  // equivalent to percent of total supply * reward rate
  rewardRate: TokenAmount
  rewardRateWeekly: TokenAmount
  // when the period ends
  periodFinish: Date | undefined
  // if pool is active
  active: boolean
  rewardsTokenSymbol?: string | undefined
  // chainId
  chainId?: ChainId
  // calculates a hypothetical amount of token distributed to the active account per second.
  getHypotheticalRewardRate: (
    stakedAmount: TokenAmount,
    totalStakedAmount: TokenAmount,
    totalRewardRate: TokenAmount,
    seconds: number,
    decimals: number,
  ) => TokenAmount,

  // all the info from stakingRewards
  rewardInfo?: any,
  userScore?: BigNumber,
  nonWithdrawalBoostPeriod: number,
  nonWithdrawalBoost: BigNumber
}

// gets the staking info from the network for the active chain id
export function useStakingInfo(pairToFilterBy?: Pair | null): StakingInfo[] {
  const { chainId, account } = useActiveWeb3React()

  // detect if staking is ended
  const currentBlockTimestamp = useCurrentBlockTimestamp()

  const info = useMemo(
    () =>
      chainId
        ? STAKING_REWARDS_INFO[chainId]?.filter(stakingRewardInfo =>
          pairToFilterBy == undefined ? true
            : pairToFilterBy.involvesToken(stakingRewardInfo.tokens[0]) &&
            pairToFilterBy.involvesToken(stakingRewardInfo.tokens[1])
        ) ?? []
        : [],
    [chainId, pairToFilterBy]
  )

  const uni = chainId ? UNI[chainId] : undefined

  const rewardsAddresses = useMemo(() => info.map(({ stakingRewardAddress }) => stakingRewardAddress), [info])

  const accountArg = useMemo(() => [account ?? undefined], [account])

  // get all the info from the staking rewards contracts
  const balances = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'balanceOf', accountArg)
  const earnedAmounts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'earned', accountArg)
  const totalSupplies = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'totalSupply')
  const scores = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'getUserScore', accountArg)
  const nonWithdrawalBoostPeriods = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'nonWithdrawalBoostPeriod')
  const nonWithdrawalBoosts = useMultipleContractSingleData(rewardsAddresses, STAKING_REWARDS_INTERFACE, 'nonWithdrawalBoost')

  // tokens per second, constants
  const rewardRates = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'rewardRate',
    undefined,
    NEVER_RELOAD
  )
  const periodFinishes = useMultipleContractSingleData(
    rewardsAddresses,
    STAKING_REWARDS_INTERFACE,
    'periodFinish',
    undefined,
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId || !uni) return []

    return rewardsAddresses.reduce<StakingInfo[]>((memo, rewardsAddress, index) => {
      // these two are dependent on account
      const balanceState = balances[index]
      const scoreState = scores[index]
      const nonWithdrawalBoostPeriodState = nonWithdrawalBoostPeriods[index]
      const nonWithdrawalBoostState = nonWithdrawalBoosts[index]
      const earnedAmountState = earnedAmounts[index]

      // these get fetched regardless of account
      const totalSupplyState = totalSupplies[index]
      const rewardRateState = rewardRates[index]
      const periodFinishState = periodFinishes[index]

      if (
        // these may be undefined if not logged in
        !balanceState?.loading &&
        !earnedAmountState?.loading &&
        !scoreState?.loading &&
        !nonWithdrawalBoostState?.loading &&
        !nonWithdrawalBoostPeriodState?.loading &&
        // always need these
        totalSupplyState &&
        !totalSupplyState.loading &&
        rewardRateState &&
        !rewardRateState.loading &&
        periodFinishState &&
        !periodFinishState.loading
      ) {
        if (
          balanceState?.error ||
          scoreState?.error ||
          earnedAmountState?.error ||
          totalSupplyState.error ||
          rewardRateState.error ||
          periodFinishState.error
        ) {
          console.error('Failed to load staking rewards info')
          return memo
        }

        // get the LP token
        const tokens = info[index].tokens
        const isSingleSided = tokens[0] === tokens[1];

        let liquidityToken;
        if (isSingleSided) {
          liquidityToken = tokens[0];
        } else {
          liquidityToken = LPTokens[chainId];
        }

        // check for account, if no account set to 0
        const currentPair = info.find(pair => pair.stakingRewardAddress === rewardsAddress)

        const rewardsToken = currentPair?.rewardInfo?.rewardToken ?? SKYFI[chainId];
        const stakedAmount = new TokenAmount(liquidityToken, JSBI.BigInt(balanceState?.result?.[0] ?? 0))
        const totalStakedAmount = new TokenAmount(liquidityToken, JSBI.BigInt(totalSupplyState.result?.[0]))
        const totalRewardRate = new TokenAmount(rewardsToken, JSBI.BigInt(rewardRateState.result?.[0]))
        const userScore = BigNumber.from(scoreState?.result?.[0] ?? "0")
        const nonWithdrawalBoostPeriod = nonWithdrawalBoostPeriodState?.result?.[0] ?? "0";
        const nonWithdrawalBoost = BigNumber.from(nonWithdrawalBoostState?.result?.[0] ?? "0")

        const getHypotheticalRewardRate = (
          stakedAmount: TokenAmount,
          totalStakedAmount: TokenAmount,
          totalRewardRate: TokenAmount,
          seconds: number,
          decimals: number

        ): TokenAmount => {
          let amount = JSBI.BigInt(0);
          if (JSBI.greaterThan(totalStakedAmount.raw, JSBI.BigInt(0))) {
            const rr = JSBI.multiply(totalRewardRate.raw, JSBI.BigInt(seconds));
            const sa = stakedAmount.raw;
            const tsa = totalStakedAmount.raw;
            const urr = JSBI.multiply(JSBI.multiply(rr, sa), JSBI.BigInt(decimals));
            amount = JSBI.divide(urr, tsa);
          }
          return new TokenAmount(
            rewardsToken,
            amount
          )
        }

        const individualRewardRate = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate, 1, 1)
        const individualRewardRateWeekly = getHypotheticalRewardRate(stakedAmount, totalStakedAmount, totalRewardRate, 60 * 60 * 24 * 7, 1)

        const periodFinishSeconds = periodFinishState.result?.[0]?.toNumber()
        const periodFinishMs = periodFinishSeconds * 1000

        // compare period end timestamp vs current block timestamp (in seconds)
        const active =
          periodFinishSeconds && currentBlockTimestamp ? periodFinishSeconds > currentBlockTimestamp.toNumber() : true

        memo.push({
          stakingRewardAddress: rewardsAddress,
          tokens: info[index].tokens,
          periodFinish: periodFinishMs > 0 ? new Date(periodFinishMs) : undefined,
          earnedAmount: new TokenAmount(rewardsToken, JSBI.BigInt(earnedAmountState?.result?.[0] ?? 0)),
          rewardRate: individualRewardRate,
          rewardRateWeekly: individualRewardRateWeekly,
          totalRewardRate: totalRewardRate,
          stakedAmount: stakedAmount,
          totalStakedAmount: totalStakedAmount,
          getHypotheticalRewardRate,
          active,
          rewardsTokenSymbol: rewardsToken.symbol,
          chainId,
          rewardInfo: currentPair?.rewardInfo,
          userScore: userScore,
          nonWithdrawalBoostPeriod: nonWithdrawalBoostPeriod,
          nonWithdrawalBoost: nonWithdrawalBoost
        })
      }
      return memo
    }, [])
  }, [
    balances,
    scores,
    chainId,
    currentBlockTimestamp,
    earnedAmounts,
    info,
    periodFinishes,
    rewardRates,
    rewardsAddresses,
    totalSupplies,
    uni
  ])
}

export function useTotalUniEarned(): TokenAmount | undefined {
  const { chainId } = useActiveWeb3React()
  const uni = chainId ? UNI[chainId] : undefined
  const stakingInfos = useStakingInfo()

  return useMemo(() => {
    if (!uni) return undefined
    return (
      stakingInfos?.reduce(
        (accumulator, stakingInfo) => accumulator.add(stakingInfo.earnedAmount),
        new TokenAmount(uni, '0')
      ) ?? new TokenAmount(uni, '0')
    )
  }, [stakingInfos, uni])
}

// based on typed value
export function useDerivedStakeInfo(
  typedValue: string,
  stakingToken: Token,
  userLiquidityUnstaked: TokenAmount | undefined
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingToken)

  const parsedAmount =
    parsedInput && userLiquidityUnstaked && JSBI.lessThanOrEqual(parsedInput.raw, userLiquidityUnstaked.raw)
      ? parsedInput
      : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter amount'
  }

  return {
    parsedAmount,
    error
  }
}

// based on typed value
export function useDerivedUnstakeInfo(
  typedValue: string,
  stakingAmount: TokenAmount
): {
  parsedAmount?: CurrencyAmount
  error?: string
} {
  const { account } = useActiveWeb3React()

  const parsedInput: CurrencyAmount | undefined = tryParseAmount(typedValue, stakingAmount.token)

  const parsedAmount = parsedInput && JSBI.lessThanOrEqual(parsedInput.raw, stakingAmount.raw) ? parsedInput : undefined

  let error: string | undefined
  if (!account) {
    error = 'Connect Wallet'
  }
  if (!parsedAmount) {
    error = error ?? 'Enter amount'
  }

  return {
    parsedAmount,
    error
  }
}
