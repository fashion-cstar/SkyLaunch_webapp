import { BigNumber, ethers, utils } from 'ethers'

function parseEther(n: string, decimals: number = 18): BigNumber {
    return utils.parseUnits(n, decimals)    
}

export default parseEther