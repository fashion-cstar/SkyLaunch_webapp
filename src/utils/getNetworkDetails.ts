import { ChainId } from '@skylaunch/sdk'

export const NETWORK_LABELS: { [chainId in ChainId]?: string } = {
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

export const NETWORK_NAMES: { [chainId in ChainId]?: string } = {
    [ChainId.RINKEBY]: 'Rinkeby',
    [ChainId.ROPSTEN]: 'Ropsten',
    [ChainId.GÖRLI]: 'Görli',
    [ChainId.KOVAN]: 'Kovan',
    [ChainId.FUJI]: 'Avalanche',
    [ChainId.AVALANCHE]: 'Avalanche',
    [ChainId.SMART_CHAIN]: 'BSC Mainnet',
    [ChainId.SMART_CHAIN_TEST]: 'BSC Testnet',
    [ChainId.MOONBASE_ALPHA]: 'Moonbeam',
    [ChainId.MUMBAI]: 'Mumbai',
    [ChainId.MAINNET]: 'Ethereum',
    [ChainId.MATIC]: 'Polygon',
    [ChainId.HECO]: 'HECO'
}

export const NETWORK_SYMBOLS: any = {
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