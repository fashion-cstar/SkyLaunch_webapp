import { Token } from '@skylaunch/sdk'
import { BigNumber, ethers, utils } from 'ethers'

function formatEtherForRound(amount: BigNumber, decimals: number = 18, toFixed: number): string {    
    let res = ethers.FixedNumber.fromString(utils.formatUnits(amount, decimals)).round(toFixed).toString()  
    return res
}

export function fundingAmountGteMaxAlloc(fundingAmount: BigNumber, maxAlloc:BigNumber, decimals: number = 18, toFixed: number): boolean { 
    let fixedFundingAmount=formatEtherForRound(fundingAmount, decimals, toFixed)   
    let fixedMaxAlloc=formatEtherForRound(maxAlloc, decimals, toFixed)   
    let BigFixedFundingAmount = utils.parseUnits(fixedFundingAmount,decimals)
    let BigFixedMaxAlloc = utils.parseUnits(fixedMaxAlloc,decimals)
    
    return BigFixedFundingAmount.gte(BigFixedMaxAlloc)
}

export function fundingAmountLtMaxAlloc(fundingAmount: BigNumber, maxAlloc:BigNumber, decimals: number = 18, toFixed: number): boolean { 
    let fixedFundingAmount=formatEtherForRound(fundingAmount, decimals, toFixed)   
    let fixedMaxAlloc=formatEtherForRound(maxAlloc, decimals, toFixed)   
    let BigFixedFundingAmount = utils.parseUnits(fixedFundingAmount,decimals)
    let BigFixedMaxAlloc = utils.parseUnits(fixedMaxAlloc,decimals)
    
    return BigFixedFundingAmount.lt(BigFixedMaxAlloc)
}

export function fundingAmountGtMaxAlloc(fundingAmount: BigNumber, maxAlloc:BigNumber, decimals: number = 18, toFixed: number): boolean { 
    let fixedFundingAmount=formatEtherForRound(fundingAmount, decimals, toFixed)   
    let fixedMaxAlloc=formatEtherForRound(maxAlloc, decimals, toFixed)   
    let BigFixedFundingAmount = utils.parseUnits(fixedFundingAmount,decimals)
    let BigFixedMaxAlloc = utils.parseUnits(fixedMaxAlloc,decimals)
    
    return BigFixedFundingAmount.gt(BigFixedMaxAlloc)
}
