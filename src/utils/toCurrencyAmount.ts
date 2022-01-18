import { BigNumber } from '@ethersproject/bignumber'

function toCurrencyAmount(n: number, decimals: number): BigNumber {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

export default toCurrencyAmount