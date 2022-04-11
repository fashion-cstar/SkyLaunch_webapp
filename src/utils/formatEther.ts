import { Token } from '@skylaunch/sdk'
import { BigNumber, ethers, utils } from 'ethers'

function formatEther(amount: BigNumber, decimals: number = 18, toFixed: number, groupSeparator: boolean): string {    
    let res
    if (toFixed>=decimals){
        res = ethers.FixedNumber.fromString(utils.formatUnits(amount, decimals)).toString()
    }else{
        let fixed=ethers.FixedNumber.fromString(utils.formatUnits(BigNumber.from(10).pow(toFixed),0))        
        res = ethers.FixedNumber.fromString(utils.formatUnits(amount, decimals-toFixed)).floor().divUnsafe(fixed).toString()
    }
    if (res.substring(res.length-2,res.length)==='.0'){
        res=res.substring(0,res.length-2)
    }
    if (groupSeparator){
        res=utils.commify(res)
    }
    return res
}

export default formatEther