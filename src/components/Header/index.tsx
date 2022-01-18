import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import ArrowDropdown from './../../assets/svg/dropdown_arrow.svg'
import BlockchainLogo from '../BlockchainLogo'
import { CHAIN_LABELS } from '../../constants'
import { ChainId } from '@skylaunch/sdk'
import ClaimModal from '../claim/ClaimModal'
import CrossChainModal from 'components/CrossChainModal'
import Loader from '../Loader'
import PlainPopup from 'components/Popups/PlainPopup'
import { PopupContent } from 'state/application/actions'
import { Text } from 'rebass'
import Web3Status from '../Web3Status'
import { YellowCard } from '../Card'
import ZeroLogo from '../../assets/images/zero-logo-text.png'
import { useActiveWeb3React } from '../../hooks'
import { useCrosschainState } from 'state/crosschain/hooks'
import { useETHBalances } from '../../state/wallet/hooks'

const HeaderFrame = styled.div`
  display: grid;
  padding: 0px 64px;
  grid-template-columns: 1fr 0px;
  align-items: center;
  width: 100%;
  height: 80px;
  background-color: #1c1c1c;
  position: relative;
  z-index: 2;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: 0px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    grid-template-columns: 1fr;
    padding: 0;
    width: calc(100%);
  `};
`

const HideSmall = styled.span`
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`
const HeaderControls = styled.div`
  padding: 0px 19px;
  display: flex;
  align-items: end;
  justify-self: flex-end;
  justify-content: space-between;
  background: #1c1c1c;
  backdrop-filter: blur(28px);
  border-radius: 44px;
  height: 76px;
  min-width: 465px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    justify-self: center;
    width: 100%;
    position: fixed;
    bottom: 0px;
    left: 0px;
    border-radius: 0;
    min-width: 0;
  `};
`
const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    flex-direction: row-reverse;
  `};
`
const AccountElement = styled.div<{ active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  margin-top: 5px;
  cursor: pointer;
  :focus {
    border: 1px solid blue;
  }
`
const NetworkCard = styled(YellowCard)`
  position: relative;
  padding-top: 5px;
  padding-left: 50px;
  width: 230px;
  height: 36px;
  letter-spacing: 0.05em;
  color: #ffffff;
  background: #000;
  border-radius: 54px;
  transition: all 0.2s ease-in-out;
  font-family: Poppins;
  font-size: 16px;
  text-transform: uppercase;
  margin-right: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    margin-right: 0.5rem;
    width: initial;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  `};
  &:hover {
    background: rgba(225, 248, 250, 0.16);
    cursor: pointer;
  }
`
const BalanceText = styled(Text)`
  font-family: Poppins;
  font-weight: 600;
  font-size: 14px;
  line-height: 80%;
  letter-spacing: -0.01em;
  color: #ffffff;
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    display: none;
  `};
`
const BlockchainLogoWrap = styled.span`
  position: absolute;
  left: 10px;
  top: 7px;
`
const ArrowDropWrap = styled.span`
  transform: scale(0.7);
  position: absolute;
  right: 5px;
  top: 1px;
`
const NotConnectedWrap = styled.div`
  padding: 22px 19px;
  display: flex;
  align-items: center;
  justify-self: flex-end;
  justify-content: space-between;
  min-width: 0px;
  height: 0px;
  &.no-point {
    pointer-events: none;
  }
  ${({ theme }) => theme.mediaWidth.upToMedium`
    position: relative;
    margin: 0 auto;
  `};
`

const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ROPSTEN]: 'Ropsten',
  [ChainId.GÖRLI]: 'Görli',
  [ChainId.KOVAN]: 'Kovan',
  [ChainId.FUJI]: 'Avalanche',
  [ChainId.AVALANCHE]: 'Avalanche',
  [ChainId.SMART_CHAIN]: 'SmartChain',
  [ChainId.SMART_CHAIN_TEST]: 'SmartChain',
  [ChainId.MOONBASE_ALPHA]: 'Moonbeam',
  [ChainId.MUMBAI]: 'Mumbai',
  [ChainId.MAINNET]: 'Ethereum',
  [ChainId.MATIC]: 'Polygon',
  [ChainId.HECO]: 'HECO'
}

const NETWORK_SYMBOLS: any = {
  Ethereum: 'ETH',
  Rinkeby: 'ETH',
  Ropsten: 'ETH',
  Görli: 'ETH',
  Kovan: 'ETH',
  Avalanche: 'AVAX',
  SmartChain: 'BNB',
  Moonbeam: 'DEV',
  Polygon: 'MATIC',
  HECO: 'HT'
}

const popupContent: PopupContent = {
  simpleAnnounce: {
    message: 'Please wait 5 seconds to change RPCs again.'
  }
}

const NetworkSwitcher = () => {
  const { chainId } = useActiveWeb3React()
  const { availableChains: allChains, lastTimeSwitched } = useCrosschainState()
  const availableChains = useMemo(() => {
    return allChains.filter(i => i.name !== (chainId ? CHAIN_LABELS[chainId] : 'Ethereum'))
  }, [allChains])

  const [crossChainModalOpen, setShowCrossChainModal] = useState(false)
  const [crossPopupOpen, setShowPopupModal] = useState(false)

  const hidePopupModal = () => setShowPopupModal(false)
  const hideCrossChainModal = () => setShowCrossChainModal(false)

  const showCrossChainModal = () => {
    const currentTime = ~~(Date.now() / 1000)
    if (lastTimeSwitched < currentTime) {
      setShowCrossChainModal(true)
    } else {
      setShowPopupModal(true)
      setTimeout(() => {
        hidePopupModal()
      }, 2000)
    }
  }

  return (
    <div onClick={showCrossChainModal}>
      <HideSmall>
        {chainId && NETWORK_LABELS[chainId] && (
          <NetworkCard title={NETWORK_LABELS[chainId]}>
            <BlockchainLogoWrap>
              <BlockchainLogo size="22px" blockchain={chainId ? NETWORK_LABELS[chainId] : 'Ethereum'} />
            </BlockchainLogoWrap>
            <span>{NETWORK_LABELS[chainId]}</span>
            <ArrowDropWrap>
              <img src={ArrowDropdown} alt="ArrowDropdown" />
            </ArrowDropWrap>
          </NetworkCard>
        )}
      </HideSmall>
      <CrossChainModal
        isOpen={crossChainModalOpen}
        isTransfer={false}
        onDismiss={hideCrossChainModal}
        supportedChains={availableChains}
        selectTransferChain={() => {}}
        activeChain={chainId ? NETWORK_LABELS[chainId] : 'Ethereum'}
      />
      <PlainPopup isOpen={crossPopupOpen} onDismiss={hidePopupModal} content={popupContent} removeAfterMs={2000} />
    </div>
  )
}
const Header = () => {
  const { account, chainId } = useActiveWeb3React()  
  const userEthBalance = useETHBalances(account ? [account] : [], chainId)?.[account ?? '']
  let label,
    symbol = ''

  if (chainId) {
    label = NETWORK_LABELS[chainId]
    symbol = NETWORK_SYMBOLS[label || 'Ethereum']
  }

  return (
    <HeaderFrame>
      <ClaimModal />
      {account && userEthBalance ? (
        <HeaderControls>
          <HeaderElement>
            <NetworkSwitcher />
            <AccountElement active={!!account}>
              <BalanceText>
                {userEthBalance?.toSignificant(4)} {symbol}
              </BalanceText>
              <Web3Status />
            </AccountElement>
          </HeaderElement>
        </HeaderControls>
      ) : account && !userEthBalance ? (
        <NotConnectedWrap className="no-point">
          <Loader stroke="#6752F7" style={{ marginRight: '10px' }} />
          <Web3Status />
        </NotConnectedWrap>
      ) : (
        <NotConnectedWrap>
          <Web3Status />
        </NotConnectedWrap>
      )}
    </HeaderFrame>
  )
}

export default Header
