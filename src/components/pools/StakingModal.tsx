import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { ButtonConfirmed, ButtonError } from '../Button'
import { ChainId, Pair, TokenAmount } from '@skylaunch/sdk'
import { CloseIcon, TYPE } from '../../theme'
import { LoadingView, SubmittedView } from '../ModalViews'
import React, { useCallback, useState } from 'react'
import Row, { RowBetween, RowCenter } from '../Row'
import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
import { usePairContract, useStakingContract } from '../../hooks/useContract'

import { AutoColumn } from '../Column'
import CurrencyInputPanel from '../CurrencyInputPanel'
import DoubleCurrencyLogo from '../DoubleLogo'
import Modal from '../Modal'
import ProgressCircles from '../ProgressSteps'
import { TransactionResponse } from '@ethersproject/providers'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { splitSignature } from 'ethers/lib/utils'
import styled from 'styled-components'
import { useActiveWeb3React } from '../../hooks'
import useIsArgentWallet from '../../hooks/useIsArgentWallet'
import { useTransactionAdder } from '../../state/transactions/hooks'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { LPTokens, ZERO_ADDRESS } from '../../constants'
import { Slider, withStyles } from '@material-ui/core'
import QuestionHelper from 'components/QuestionHelper'
import { BigNumber } from 'ethers'

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;
  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

const HypotheticalScoreBoost = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;
  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const SkySlider = withStyles({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const Flex = styled(Row)`
  align-items: center;
  justify-content: space-between;
`

const TextEarned = styled.h4`
  font-size: 12px;
  margin-top: 25px;
  margin-bottom: 5px;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
  userLiquidityUnstaked: TokenAmount | undefined
}

export default function StakingModal({ isOpen, onDismiss, stakingInfo, userLiquidityUnstaked }: StakingModalProps) {
  const { account, chainId, library } = useActiveWeb3React()

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingInfo.stakedAmount.token, userLiquidityUnstaked)
  const parsedAmountWrapped = wrappedCurrencyAmount(parsedAmount, chainId)
  const [lockValue, setLockValue] = useState(7);

  let hypotheticalRewardRate: TokenAmount = new TokenAmount(stakingInfo.rewardRate.token, '0')
  let hypotheticalScoreBoost: BigNumber = BigNumber.from('0');

  if (parsedAmountWrapped?.greaterThan('0')) {
    hypotheticalRewardRate = stakingInfo.getHypotheticalRewardRate(
      stakingInfo.stakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalStakedAmount.add(parsedAmountWrapped),
      stakingInfo.totalRewardRate,
      60 * 60 * 24 * 7,
      1
    )
    const bgParsedAmount = BigNumber.from(parsedAmountWrapped.raw.toString());
    let amountScore = lockValue >= 30 ? bgParsedAmount : bgParsedAmount.mul(lockValue).div(30);
    let amount = bgParsedAmount.div(BigNumber.from("1000000000000000000"));
    hypotheticalScoreBoost = amountScore.add(amount.mul(lockValue).div(stakingInfo.nonWithdrawalBoostPeriod).mul(stakingInfo.nonWithdrawalBoost));
    hypotheticalScoreBoost = hypotheticalScoreBoost.div(BigNumber.from("1000000000000000000"));
  }

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }, [onDismiss])


  let dummyPair = null;
  let pairAddress = null;
  // pair contract for this token to be staked
  const isSingleSided = stakingInfo.tokens[0] === stakingInfo.tokens[1];
  if (!isSingleSided) {
    dummyPair = new Pair(new TokenAmount(stakingInfo.tokens[0], '0'), new TokenAmount(stakingInfo.tokens[1], '0'));
    if (chainId)
      pairAddress = LPTokens[chainId].address;
    else
      pairAddress = ZERO_ADDRESS;
  } else {
    pairAddress = stakingInfo?.stakedAmount?.token.address;
  }

  const pairContract = usePairContract(pairAddress);

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, stakingInfo.stakingRewardAddress)

  const isArgentWallet = useIsArgentWallet()
  const stakingContract = useStakingContract(stakingInfo.stakingRewardAddress)
  async function onStake() {
    setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        await stakingContract.stake(`0x${parsedAmount.raw.toString(16)}`, { gasLimit: 350000 })
      } else if (signatureData) {
        stakingContract
          .stakeWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit liquidity`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  async function onStakeWithLock() {
    setAttempting(true)
    if (stakingContract && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        await stakingContract.stakeWithLock(`0x${parsedAmount.raw.toString(16)}`, lockValue, { gasLimit: 350000 })
      } else if (signatureData) {
        stakingContract
          .stakeWithLockWithPermit(
            `0x${parsedAmount.raw.toString(16)}`,
            lockValue,
            signatureData.deadline,
            signatureData.v,
            signatureData.r,
            signatureData.s,
            { gasLimit: 350000 }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit liquidity`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            console.log(error)
          })
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }

  const handleLockChange = useCallback((event: object, value: number | number[]) => {
    console.log(event);
    setLockValue(Array.isArray(value) ? value[0] : value);
  }, [])

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(
      maxAmountInput
        ?.toSignificant(Math.min(4, stakingInfo?.earnedAmount?.currency.decimals))
    )
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!pairContract || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    if (isArgentWallet) {
      return approveCallback()
    }

    // if it's sushi pair, just use the usual approve
    if (pairContract.address == '0xE9a889E6963f122a98f8083d951c71329c726c0A') return approveCallback();

    // try to gather a signature for permission
    const nonce = await pairContract.nonces(account).catch((e: any) => null);
    const contractName = await pairContract.name();

    if (nonce == null) return approveCallback();

    const EIP712Domain = [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' }
    ]
    const domain = {
      name: contractName,
      version: '1',
      chainId: chainId,
      verifyingContract: pairContract.address
    }
    const Permit = [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
    const message = {
      owner: account,
      spender: stakingInfo.stakingRewardAddress,
      value: liquidityAmount.raw.toString(),
      nonce: nonce.toHexString(),
      deadline: deadline.toNumber()
    }
    const data = JSON.stringify({
      types: {
        EIP712Domain,
        Permit
      },
      domain,
      primaryType: 'Permit',
      message
    })

    library
      .send('eth_signTypedData_v4', [account, data])
      .then(splitSignature)
      .then(signature => {
        setSignatureData({
          v: signature.v,
          r: signature.r,
          s: signature.s,
          deadline: deadline.toNumber()
        })
      })
      .catch(error => {
        // for all errors other than 4001 (EIP-1193 user rejected request), fall back to manual approve
        if (error?.code !== 4001) {
          approveCallback()
        }
      })
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="md">
          <RowBetween>
            <DoubleCurrencyLogo currency0={dummyPair?.token0} currency1={dummyPair?.token1} size={32} />
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <RowCenter>
            <TYPE.mediumHeader>Deposit {isSingleSided ? stakingInfo.tokens[0].symbol : dummyPair?.token0.symbol + '-' + dummyPair?.token1.symbol}</TYPE.mediumHeader>
          </RowCenter>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingInfo.stakedAmount.token}
            pair={dummyPair}
            label={''}
            disableCurrencySelect={true}
            hideCurrencySelect={true}
            customBalanceText={isSingleSided ? 'Available tokens: ' : 'Available LP: '}
            id="stake-liquidity-token"
            stakingInfo={stakingInfo}
          />
          <TextEarned>Lock(days)<QuestionHelper text="Instantly increase your score by locking your stake in the vault." /></TextEarned>
          <Flex>
            <SkySlider valueLabelDisplay="auto" onChange={handleLockChange} aria-label="pretto slider" min={7} max={365} defaultValue={7} />
          </Flex>

          <HypotheticalScoreBoost dim={!hypotheticalRewardRate.greaterThan('0')}>
            <div>
              <TYPE.black fontWeight={600}>Score Boost</TYPE.black>
            </div>

            <TYPE.black>
              {hypotheticalScoreBoost.toNumber()}
            </TYPE.black>
          </HypotheticalScoreBoost>

          <HypotheticalRewardRate dim={!hypotheticalRewardRate.greaterThan('0')}>
            <div>
              <TYPE.black fontWeight={600}>Weekly Rewards</TYPE.black>
            </div>

            <TYPE.black>
              {hypotheticalRewardRate
                .divide(stakingInfo?.rewardInfo?.rewardsMultiplier ? stakingInfo?.rewardInfo?.rewardsMultiplier : 1)
                .toSignificant(4, { groupSeparator: ',' })}{' '}
              {stakingInfo?.rewardsTokenSymbol ?? 'SKYFI'} / week
            </TYPE.black>
          </HypotheticalRewardRate>

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={onAttemptToApprove}
              confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
              disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
            >
              Approve
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
              error={!!error && !!parsedAmount}
              onClick={lockValue > 7 ? onStakeWithLock : onStake}
            >
              {error ?? 'Deposit'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED || signatureData !== null]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>{isSingleSided ? `Depositing tokens` : `Depositing Liquidity`}</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{parsedAmount?.toSignificant(4)} {isSingleSided ? `Tokens` : `SKYFI LP`}</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Deposited {parsedAmount?.toSignificant(4)} {isSingleSided ? `Tokens` : `SKYFI LP`}</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
