import { BigNumber } from '@ethersproject/bignumber'
import { Token } from '@skylaunch/sdk'

function toEtherAmount(amount: BigNumber, token: Token, toFixed: number): number {
    let temp:BigNumber=amount.mul(BigNumber.from(10).pow(toFixed))
    temp=temp.div(BigNumber.from(10).pow(token.decimals))

    return Math.round((temp.toNumber())/(10**toFixed))
}

export default toEtherAmount