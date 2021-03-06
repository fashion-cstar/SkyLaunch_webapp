import { CHAIN_LABELS, NetworkContextName } from '../../constants'
import { CrosschainChain, setTargetChain } from 'state/crosschain/actions'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { fortmatic, injected, portis, walletconnect, walletlink } from '../../connectors'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import styled, { css } from 'styled-components'

import { AbstractConnector } from '@web3-react/abstract-connector'
import { Activity } from 'react-feather'
import { AppDispatch } from 'state'
import { ButtonPrimary, ButtonSecondary } from '../Button'
import ChainSwitcherContent from 'components/WalletModal/ChainSwitcherContent'
import CoinbaseWalletIcon from '../../assets/images/coinbaseWalletIcon.svg'
import CrossChainModal from 'components/CrossChainModal'
import FortmaticIcon from '../../assets/images/fortmaticIcon.png'
import Identicon from '../Identicon'
import Loader from '../Loader'
import PortisIcon from '../../assets/images/portisIcon.png'
import { RowBetween } from '../Row'
import { TransactionDetails } from '../../state/transactions/reducer'
import WalletConnectIcon from '../../assets/images/walletConnectIcon.svg'
import WalletModal from '../WalletModal'
import { shortenAddress } from '../../utils'
import { useActiveWeb3React } from 'hooks'
import { useCrossChain, useCrosschainState } from 'state/crosschain/hooks'
import { useDispatch } from 'react-redux'
import useENSName from '../../hooks/useENSName'
import { useHasSocks } from '../../hooks/useSocksBalance'
import { useTranslation } from 'react-i18next'
import { useWalletModalToggle } from '../../state/application/hooks'
import { useETHBalances } from '../../state/wallet/hooks'
import { useLoginWithMetaMask, useIsLogging, useKYCStatus } from 'state/fundraising/hooks'
import { setIsLogging, setIsFormSent } from 'state/fundraising/actions'

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonPrimary)`
  ${({ theme }) => theme.flexRowNoWrap}
  align-self: flex-start;
  width: 100%;
  padding: 8px 20px;
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  :focus {
    outline: none;
  }
`

const Web3StatusConnect = styled(Web3StatusGeneric) <{ faded?: boolean }>`
  border: none;
  font-weight: 500;
  transition: all .2s ease-in-out;
  text-transform: uppercase;
  max-width: 200px;
  ${({ faded }) =>
    faded &&
    css`
      box-sizing: border-box;
      backdrop-filter: blur(7px);
      border-radius: 54px;
    `}
`

const Web3StatusConnected = styled.div`  
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 19px;
  letter-spacing: 0.05em;
  color: #fff;
  opacity: 0.8;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: start;
  column-gap: 30px;
`

const StatusIconWrap = styled.div<{ isBalance: boolean }>`  
  // top: 75%;
  transform: ${({ isBalance }) => (isBalance ? 'translateY(-40%)' : 'translateY(-20%)')};  
  // right: 30px;  
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
  font-size: 12px;
  width: fit-content;
  font-weight: 500;
`

const NetworkIcon = styled(Activity)`
  margin-left: 0.25rem;
  margin-right: 0.5rem;
  width: 16px;
  height: 16px;
`
const HeaderRowBetween = styled(RowBetween)`
    align-items: center;
`
const LoaderWrap = styled.div`
    display: flex;
    margin-left: 10px;
`
// we want the latest one to come first, so return negative if a is after b
function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

const SOCK = (
  <span role="img" aria-label="has socks emoji" style={{ marginTop: -4, marginBottom: -4 }}>
    ????
  </span>
)



// eslint-disable-next-line react/prop-types
function StatusIcon({ connector }: { connector: AbstractConnector }) {
  if (connector === injected) {
    return <Identicon />
  } else if (connector === walletconnect) {
    return (
      <IconWrapper size={16}>
        <img src={WalletConnectIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === walletlink) {
    return (
      <IconWrapper size={16}>
        <img src={CoinbaseWalletIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === fortmatic) {
    return (
      <IconWrapper size={16}>
        <img src={FortmaticIcon} alt={''} />
      </IconWrapper>
    )
  } else if (connector === portis) {
    return (
      <IconWrapper size={16}>
        <img src={PortisIcon} alt={''} />
      </IconWrapper>
    )
  }
  return null
}

function Web3StatusInner() {
  useCrossChain();
  const {
    availableChains: allChains,
  } = useCrosschainState()
  const dispatch = useDispatch<AppDispatch>()
  const { t } = useTranslation()
  const { account, connector, error, deactivate, activate } = useWeb3React()
  const { ENSName } = useENSName(account ?? undefined)
  const isLogging = useIsLogging()
  const { fetchLoginWithMetaMask } = useLoginWithMetaMask()

  const allTransactions = useAllTransactions()
  const { chainId } = useActiveWeb3React()
  const userEthBalance = useETHBalances(account ? [account] : [], chainId)?.[account ?? '']
  const availableChains = useMemo(() => {
    return allChains.filter(i => i.name !== (chainId ? CHAIN_LABELS[chainId] : 'Ethereum'))
  }, [allChains])

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)

  const hasPendingTransactions = !!pending.length
  const hasSocks = useHasSocks()
  const toggleWalletModal = useWalletModalToggle()
  const [crossChainModalOpen, setShowCrossChainModal] = useState(false)
  const hideCrossChainModal = () => {
    setShowCrossChainModal(false)
  }

  const [chainIdError, setChainIdError] = useState({} as UnsupportedChainIdError)
  const chainIdErrorPrev = useRef({} as UnsupportedChainIdError)

  useEffect(() => {
    chainIdErrorPrev.current = (chainIdErrorPrev.current !== chainIdError && chainIdError.toString() !== '{}') ?
      chainIdErrorPrev.current = chainIdError : chainIdErrorPrev.current
  }, [chainIdError])

  useEffect(() => {
    const signedAccount = localStorage.getItem('signedAccount')
    if (account && account.toLowerCase() !== signedAccount && !isLogging) {
      requestSignature()
    }
  }, [account, isLogging])

  const resetSignToken = () => {
    dispatch(setIsLogging({ isLogging: false }))
    dispatch(setIsFormSent({ isFormSent: false }))
  }
  useEffect(() => {
    if (!account) {
      resetSignToken()
    }
  }, [account])

  const deactivateAccount = () => {
    try {
      deactivate()
      resetSignToken()
    } catch (ex) {
      console.log(ex)
    }
  }
  
  const requestSignature = () => {
    dispatch(setIsLogging({ isLogging: true }))
    fetchLoginWithMetaMask().then(async (sign: any) => {
      if (sign) {
        if (sign?.userId && sign?.jwtToken) {
          localStorage.setItem('userId', sign.userId)
          localStorage.setItem('JwtToken', sign.jwtToken)
          localStorage.setItem('signedAccount', sign.account)
          try {
            await activate(injected)
          } catch (ex) {
            deactivateAccount()
            console.log(ex)
          }
        }
      } else {
        deactivateAccount()
      }
      dispatch(setIsLogging({ isLogging: false }))
    }).catch((error) => {
      console.log(error)
      deactivateAccount()
      dispatch(setIsLogging({ isLogging: false }))
    });
  }

  const handleWalletConnect = async () => {
    requestSignature()
  }

  const checkCrossChainId = useCallback(() => {
    if (chainIdErrorPrev.current !== chainIdError) {
      setShowCrossChainModal(true)
      chainIdErrorPrev.current = chainIdError

      return (
        <CrossChainModal
          isOpen={crossChainModalOpen}
          onDismiss={hideCrossChainModal}
          supportedChains={availableChains}
          selectTransferChain={onSelectTransferChain}
          activeChain={chainId ? CHAIN_LABELS[chainId] : 'Ethereum'}
        />
      )
    } else {
      return (
        <CrossChainModal
          isOpen={crossChainModalOpen}
          onDismiss={hideCrossChainModal}
          supportedChains={availableChains}
          selectTransferChain={onSelectTransferChain}
          activeChain={chainId ? CHAIN_LABELS[chainId] : 'Ethereum'}
        />
      )
    }

  }, [chainIdErrorPrev])
  const onSelectTransferChain = (chain: CrosschainChain) => {
    dispatch(
      setTargetChain({
        chain
      })
    )
  }

  if (account) {
    return (
      <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal}>
        {hasPendingTransactions ? (
          <HeaderRowBetween>
            <Text>{pending?.length} Pending</Text>
            <LoaderWrap>
              <Loader stroke="#6752F7" />
            </LoaderWrap>
          </HeaderRowBetween>
        ) : (
          <>
            {hasSocks ? SOCK : null}
            <Text>{ENSName || shortenAddress(account)}</Text>
          </>
        )}
        {!hasPendingTransactions && connector && (
          <StatusIconWrap isBalance={userEthBalance ? true : false}>
            <StatusIcon connector={connector} />
          </StatusIconWrap>
        )}
      </Web3StatusConnected>
    )
  }
  else if (error instanceof UnsupportedChainIdError) {
    return (<ChainSwitcherContent />)
  }
  else {
    return (
      <Web3StatusConnect id="connect-wallet" onClick={handleWalletConnect} faded={!account}>
        {t('Connect Wallet')}
      </Web3StatusConnect>
    )
  }
}

export default function Web3Status() {
  const { active, account } = useWeb3React()
  const contextNetwork = useWeb3React(NetworkContextName)
  const { ENSName } = useENSName(account ?? undefined)

  const allTransactions = useAllTransactions()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter(tx => !tx.receipt).map(tx => tx.hash)
  const confirmed = sortedRecentTransactions.filter(tx => tx.receipt).map(tx => tx.hash)

  if (!contextNetwork.active && !active) {
    return null
  }

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} pendingTransactions={pending} confirmedTransactions={confirmed} />
    </>
  )
}
