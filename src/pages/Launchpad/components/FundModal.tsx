import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
import styled from 'styled-components'
import { Token } from '@skylaunch/sdk'
import { Contract } from '@ethersproject/contracts'
import { ButtonConfirmed, ButtonError } from 'components/Button'
import { useTransactionAdder } from 'state/transactions/hooks'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import { CloseIcon, TYPE } from '../../../theme'
import { RowBetween, RowCenter } from '../../../components/Row'
import { AutoColumn } from '../../../components/Column'
import { useActiveWeb3React } from '../../../hooks'
import { ZERO_ADDRESS } from '../../../constants'
import Modal from '../../../components/Modal'
import parseEther from 'utils/parseEther'
import formatEther from 'utils/formatEther'
import { ChainId } from '@skylaunch/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { utils } from 'ethers'
import { useETHBalances } from '../../../state/wallet/hooks'
import { returnBalanceNum } from '../../../constants'
import { getContract } from '../../../utils'
import ERC20_ABI from '../../../constants/abis/erc20.json'
import { MaxUint256 } from '@ethersproject/constants'
import CurrencyLogo from 'components/CurrencyLogo'
import FundingInputPanel from 'components/FundingInputPanel'
import ProgressCircles from 'components/ProgressSteps'
import { UserInfo } from 'state/fundraising/actions'
import { useFundItCallback, useFundApproveCallback, useAddTxRevertedToast, useMaxAllocCallback, useTokenAllowanceCallback } from 'state/fundraising/hooks'
import { useAddPopup } from 'state/application/hooks'
import { SKYFUNDRAISING_ADDRESS } from 'constants/index'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const BalanceContainer = styled.div`
  margin-bottom: 20px;
`

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 20px;  
  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

interface FundModalProps {
  isOpen: boolean,
  pid: number,
  userInfoData: UserInfo,
  fundToken: Token | undefined,
  onDismiss: () => void,
  resetFundState: (isfund: boolean, fundamount: BigNumber) => void
}

export default function FundModal({ isOpen, pid, userInfoData, fundToken, onDismiss, resetFundState }: FundModalProps) {
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const { library, account, chainId } = useActiveWeb3React()
  const [amount, setFundAmount] = useState(0)
  const [accountBalance, setAccountBalance] = useState(0)
  const [isApproved, setIsApproved] = useState(false)
  const [isFunded, setFunded] = useState(false)
  const userEthBalance = useETHBalances(account ? [account] : [], chainId)?.[account ?? '']
  const [ethBalance, setEthBalance] = useState(0)
  const [typedValue, setTypedValue] = useState('')
  const [maxFunding, setMaxFunding] = useState(0)
  const [userMaxAlloc, setUserMaxAlloc] = useState(BigNumber.from(0))
  const { fundItCallback } = useFundItCallback(account)
  const { fundApproveCallback } = useFundApproveCallback(account)
  const { addTxRevertedToast } = useAddTxRevertedToast()
  const { maxAllocCallback } = useMaxAllocCallback()
  const { tokenAllowanceCallback } = useTokenAllowanceCallback()
  const [isWalletApproving, setIsWalletApproving] = useState(false)
  const [userAllowance, setUserAllowance] = useState(BigNumber.from(0))
  const [isOverMax, setIsOverMax] = useState(true)

  const wrappedOnDismiss = useCallback(() => {
    setIsApproved(false)
    setFunded(false)
    setHash(undefined)
    setAttempting(false)
    setIsWalletApproving(false)
    setFundAmount(0)
    setTypedValue('')
    setIsOverMax(true)
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    if (fundToken && pid >= 0 && isOpen && account) {
      maxAllocCallback(pid)
        .then(maxalloc => {
          if (maxalloc) setUserMaxAlloc(maxalloc)
          else setUserMaxAlloc(BigNumber.from(0))
        })
        .catch((error: any) => {
          setUserMaxAlloc(BigNumber.from(0))
        })
    }
  }, [fundToken, pid, isOpen, account])

  useEffect(() => {
    if (fundToken && pid >= 0 && isOpen && account && chainId) {
      tokenAllowanceCallback(account, SKYFUNDRAISING_ADDRESS[chainId], fundToken.address)
        .then(res => {
          setUserAllowance(res)
        })
        .catch((error: any) => {
          setUserAllowance(BigNumber.from(0))
        })
    }
  }, [fundToken, pid, isOpen, chainId, account])

  useEffect(() => {
    fundStatus()
  }, [fundToken, ethBalance, isFunded])

  useEffect(() => {
    const bal = userEthBalance?.toSignificant(returnBalanceNum(userEthBalance, 4), { groupSeparator: ',' }) || 0
    setEthBalance(Number(bal))
  }, [userEthBalance])

  useEffect(() => {
    if (userInfoData && fundToken) {
      let _amount = formatEther(userInfoData.fundingAmount, fundToken, 4)
      _amount = formatEther(userMaxAlloc, fundToken, 3) - _amount
      if (_amount > accountBalance) _amount = accountBalance
      setMaxFunding(_amount)
    }
  }, [userInfoData, userMaxAlloc, fundToken, accountBalance])

  const checkAllowance = (_fundToken: Token | undefined, _amount: number, _userAllowance: BigNumber) => {
    if (_fundToken) {
      console.log(formatEther(_userAllowance, _fundToken, 4))
      console.log(_amount)

      if (_userAllowance.gte(parseEther(_amount, _fundToken?.decimals))) {
        setIsApproved(true)
      } else {
        setIsApproved(false)
      }
    }
  }

  async function onApprove() {
    if (amount <= maxFunding) {
      if (fundToken !== undefined) {
        setIsWalletApproving(true)
        if (fundToken.address === ZERO_ADDRESS) {
          setIsApproved(true)
          setIsWalletApproving(false)
        } else {
          try {
            fundApproveCallback(pid, fundToken, userMaxAlloc).then((hash: string) => {
              if (hash) setIsApproved(true)
              setIsWalletApproving(false)
            }).catch((error: any) => {
              let err: any = error
              if (err?.message) addTxRevertedToast(err?.message)
              if (err?.error) {
                if (err?.error?.message) addTxRevertedToast(err?.error?.message)
              }
              wrappedOnDismiss()
              setIsWalletApproving(false)
            })
          } catch (error) {
            setIsWalletApproving(false)
            console.debug('Failed to approve token', error)
          }
        }
      }
    } else {
      handleMax()
    }
    return null;
  }

  const successFunding = () => {
    if (fundToken) {
      let _amount = formatEther(userInfoData.fundingAmount, fundToken, 4)
      resetFundState(true, parseEther(amount + _amount, fundToken?.decimals))
      fundStatus()
    }
  }

  async function onFundIt() {
    if (amount <= maxFunding) {
      if (fundToken && account && chainId) {
        let res = await tokenAllowanceCallback(account, SKYFUNDRAISING_ADDRESS[chainId], fundToken.address)
        if (res) {
          try {
            if (res.gte(parseEther(amount, fundToken.decimals))) {
              console.log(res)
              try {
                setAttempting(true)
                fundItCallback(pid, fundToken, amount).then((hash: string) => {
                  if (hash) {
                    setHash(hash)
                    successFunding()
                  } else {
                    setAttempting(false)
                  }
                }).catch(error => {
                  setAttempting(false)
                  let err: any = error
                  if (err?.message) addTxRevertedToast(err?.message)
                  if (err?.error) {
                    if (err?.error?.message) addTxRevertedToast(err?.error?.message)
                  }
                  wrappedOnDismiss()
                })
              } catch (error) {
                setAttempting(false)
                console.log(error)
              }
            } else {
              onFundIt()
            }
          } catch (ex) {
            onFundIt()
          }
        }
      }
    } else {
      handleMax()
    }
    return null;
  }

  async function fundStatus() {
    if (!account) return null
    if (fundToken !== undefined) {
      if (fundToken.address === ZERO_ADDRESS) {
        setAccountBalance(Number(ethBalance))
        setIsApproved(true)
      } else {
        if (!library) return null
        let tokenContract: Contract = getContract(fundToken?.address, ERC20_ABI, library, account ? account : ZERO_ADDRESS)
        let tokenBalance: BigNumber = await tokenContract.balanceOf(account ? account : ZERO_ADDRESS)
        let bal = formatEther(tokenBalance, fundToken, 4)
        setAccountBalance(bal)
      }
    }
    return null
  }

  const onUserInput = useCallback((typedValue: string) => {
    setFundAmount(Number(typedValue))
    setTypedValue(typedValue)
    if (Number(typedValue) > maxFunding || Number(typedValue) <= 0) {
      setIsOverMax(true)
    } else {
      setIsOverMax(false)
      checkAllowance(fundToken, Number(typedValue), userAllowance)
    }
  }, [fundToken, amount, userAllowance])

  const handleMax = useCallback(() => {
    // let maxAmountInput = maxAlloc
    // if (accountBalance<maxAmountInput) maxAmountInput=accountBalance
    // maxAmountInput && onUserInput(maxAmountInput.toString())
    onUserInput(maxFunding.toString())
  }, [onUserInput, maxFunding, accountBalance])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (<ContentWrapper gap="lg">
        <RowBetween>
          <CurrencyLogo currency={fundToken} size={'32px'} />
          <CloseIcon onClick={wrappedOnDismiss} />
        </RowBetween>
        <RowCenter>
          <TYPE.mediumHeader>Fund {fundToken ? fundToken.symbol : 'it'}</TYPE.mediumHeader>
        </RowCenter>
        <FundingInputPanel value={typedValue} onUserInput={onUserInput} onMax={handleMax} />
        <BalanceContainer>
          <HypotheticalRewardRate dim={accountBalance ? false : true}>
            <div>
              <TYPE.black fontWeight={600}>{fundToken ? fundToken.name : ''}{' '}Balance</TYPE.black>
            </div>

            <TYPE.black>
              {accountBalance ? accountBalance : 0}{' '}{fundToken ? fundToken.symbol : ''}
            </TYPE.black>
          </HypotheticalRewardRate>
          {userInfoData && fundToken && (<HypotheticalRewardRate dim={userInfoData.fundingAmount.gt(0) ? false : true}>
            <div>
              <TYPE.black fontWeight={600}>Funded Amount</TYPE.black>
            </div>

            <TYPE.black>
              {userInfoData ? formatEther(userInfoData.fundingAmount, fundToken, 4) : 0}{' '}{fundToken ? fundToken.symbol : ''}
            </TYPE.black>
          </HypotheticalRewardRate>)}
          <HypotheticalRewardRate dim={userInfoData ? false : true}>
            <div>
              <TYPE.black fontWeight={600}>Multiplier</TYPE.black>
            </div>

            <TYPE.black>
              {userInfoData ? userInfoData.multiplier.toNumber() : 0}
            </TYPE.black>
          </HypotheticalRewardRate>
          {fundToken && (<HypotheticalRewardRate dim={formatEther(userMaxAlloc, fundToken, 3) ? false : true}>
            <div>
              <TYPE.black fontWeight={600}>Max Allocation</TYPE.black>
            </div>

            <TYPE.black>
              {userMaxAlloc && userInfoData ? formatEther(userMaxAlloc.sub(userInfoData.fundingAmount), fundToken, 3) : 0}{' '}{fundToken.symbol}
            </TYPE.black>
          </HypotheticalRewardRate>)}
        </BalanceContainer>
        <RowBetween>
          <ButtonConfirmed
            mr="0.5rem"
            onClick={onApprove}
            confirmed={isApproved}
            disabled={!fundToken || isApproved || !accountBalance || isWalletApproving || isOverMax}
          >
            Approve
          </ButtonConfirmed>
          <ButtonConfirmed
            disabled={!fundToken || isFunded || !accountBalance || !isApproved || isOverMax}
            confirmed={isFunded}
            onClick={onFundIt}
          >
            Fund it
          </ButtonConfirmed>
        </RowBetween>
        <ProgressCircles steps={[isApproved]} disabled={true} />
      </ContentWrapper>)}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Funding {fundToken ? fundToken.name : ''}</TYPE.largeHeader>
            <TYPE.body fontSize={20}>{amount}{' '}{fundToken ? fundToken.symbol : ''}</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Funded {amount}{' '}{fundToken ? fundToken.symbol : ''}</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
