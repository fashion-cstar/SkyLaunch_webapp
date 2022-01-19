import { BigNumber, ethers, utils } from 'ethers'

function toCurrencyAmount(n: number, decimals: number): BigNumber {
    return BigNumber.from(utils.parseUnits(n.toString(), decimals))    
}

export default toCurrencyAmount