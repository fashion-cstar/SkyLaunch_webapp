import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
import styled from 'styled-components'
import { Token } from '@skylaunch/sdk'
import { Contract } from '@ethersproject/contracts'
import { ButtonConfirmed, ButtonError } from 'components/Button'
import { CloseIcon, TYPE } from '../../../theme'
import { RowBetween, RowCenter } from '../../../components/Row'
import { AutoColumn } from '../../../components/Column'
import { useActiveWeb3React } from '../../../hooks'
import { ZERO_ADDRESS } from '../../../constants'
import Modal from '../../../components/Modal'
import { calculateGasMargin } from '../../../utils'
import toCurrencyAmount from 'utils/toCurrencyAmount'
import toEtherAmount from 'utils/toEtherAmount'
import { ChainId } from '@skylaunch/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { utils } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { useETHBalances } from '../../../state/wallet/hooks'
import { returnBalanceNum } from '../../../constants'
import { getContract } from '../../../utils'
import ERC20_ABI from '../../../constants/abis/erc20.json'
import { MaxUint256 } from '@ethersproject/constants'
import CurrencyLogo from 'components/CurrencyLogo'
import FundingInputPanel from 'components/FundingInputPanel'
import ProgressCircles from 'components/ProgressSteps'
import { UserInfo, PoolInfo, setUserInfo, setIsFunded } from 'state/fundraising/actions'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;
  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

interface FundModalProps {
  isOpen: boolean,
  fundRaisingContract: Contract | null,
  pid: number,
  userInfoData: UserInfo,
  poolInfoData: PoolInfo,
  maxAlloc: number,
  fundToken: Token | undefined,
  onDismiss: () => void
}

interface valueProps {
  address: string
  pid: number
  decimals: number
  chainId: number  
}

export default function FundModal({ isOpen, fundRaisingContract, pid, userInfoData, poolInfoData, maxAlloc, fundToken, onDismiss }: FundModalProps) {  
  const dispatch = useDispatch<AppDispatch>()
  const { library, account, chainId } = useActiveWeb3React()  
  const [amount, setFundAmount] = useState(0)    
  const [accountBalance, setAccountBalance] = useState(0)  
  const [isApproved, setIsApproved] = useState(false)
  const [isFunded, setFunded] = useState(false)  
  const userEthBalance=useETHBalances(account ? [account] : [], chainId)?.[account ?? '']  
  const [ethBalance, setEthBalance] = useState(0)
  const [typedValue, setTypedValue] = useState('')
  const [maxFunding, setMaxFunding] = useState(0)
  const wrappedOnDismiss = useCallback(() => {
    onDismiss()
    setIsApproved(false)
    setFunded(false)
  }, [onDismiss])

  useEffect(() => {
    
  }, [])
  useEffect(() => {    
    fundStatus()
  }, [fundToken, ethBalance, isFunded])

  useEffect(() => {
    const bal=userEthBalance?.toSignificant(returnBalanceNum(userEthBalance, 4), { groupSeparator: ',' }) || 0    
    setEthBalance(Number(bal))
  }, [userEthBalance])

  useEffect(() => {
    if (userInfoData && fundToken){
      let _amount=toEtherAmount(userInfoData.fundingAmount, fundToken, 4)      
      _amount=maxAlloc-_amount      
      if (_amount>accountBalance) _amount=accountBalance      
      setMaxFunding(_amount)
    }
  }, [userInfoData, maxAlloc, fundToken, accountBalance])

  async function onApprove() {
    if (fundRaisingContract && amount<=maxFunding){
      if (fundToken!==undefined){        
        if (fundToken.address===ZERO_ADDRESS){          
          setIsApproved(true)
        }else{
          if (!library) return null
          if (amount<1) return null
          let useExact = false
          let tokenContract:Contract=getContract(fundToken?.address, ERC20_ABI, library, account ? account : undefined)          
          try{        
            let estimatedGas = await tokenContract.estimateGas.approve(fundRaisingContract.address, MaxUint256).catch(() => {              
              useExact = true
              return tokenContract.estimateGas.approve(fundRaisingContract.address, toCurrencyAmount(amount, fundToken?.decimals))
            })
                    
            let gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas
        
            tokenContract.approve(fundRaisingContract.address, useExact ? toCurrencyAmount(amount, fundToken?.decimals) : MaxUint256, {
              gasLimit: calculateGasMargin(gas)
            })
            .then((response: TransactionResponse) => {        
              setIsApproved(true)
              console.log(response)
            })
            .catch((error: Error) => {
              console.debug('Failed to approve token', error)              
            })
          }catch(error){
            console.debug('Failed to approve token', error)
            
          }
        }
      }      
    }
    return null;
  }

  const successFunding=() => {
    if (fundToken){
      let _amount=toEtherAmount(userInfoData.fundingAmount, fundToken, 4)         
      setFunded(true)
      dispatch(setIsFunded({isFunded:true}))
      if (userInfoData) dispatch(setUserInfo({userInfo:{...userInfoData, fundingAmount:toCurrencyAmount(amount+_amount, fundToken?.decimals)}}))
    }
  }

  async function onFundIt() {    
    if (fundRaisingContract && amount<=maxFunding){
      if (fundToken){        
        if (fundToken.address===ZERO_ADDRESS){             
          let useExact = false
          try{                    
            const estimatedGas = await fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
              value:toCurrencyAmount(amount, fundToken?.decimals)
            }).catch(() => {        
              useExact = true
              return fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
                value:toCurrencyAmount(amount, fundToken?.decimals)
              })
            })        
            const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas                    
            fundRaisingContract.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
              gasLimit: calculateGasMargin(gas), value:toCurrencyAmount(amount, fundToken?.decimals)
            })
            .then((response: TransactionResponse) => {                        
              console.log(response)
              successFunding()
            })
            .catch((error: Error) => {
              console.debug('Failed to subscribe token', error)
              //throw error
            }) 
          }catch(error){
            console.debug('Failed to subscribe', error)
            //throw error
          }
        }else{
          if (!library) return null
          if (amount<1) return null             
          try{       
            let useExact = false
            let estimatedGas = await fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals)).catch(() => {        
              useExact = true
              return fundRaisingContract.estimateGas.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals))
            })        
            let gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas        
            fundRaisingContract.fundSubscription(pid, toCurrencyAmount(amount, fundToken?.decimals), {
              gasLimit: calculateGasMargin(gas)
            })
            .then((response: TransactionResponse) => {                        
              console.log(response)
              successFunding()
            })
            .catch((error: Error) => {
              console.debug('Failed to fundSubscribe token', error)
              //throw error
            }) 
          }catch(error){
            console.debug('Failed to fundSubscribe', error)            
          }
        }
      }      
    }
    return null;
  }

  async function fundStatus() {    
    if (!account) return null
    if (fundRaisingContract){    
      if (fundToken!==undefined){                  
        if (fundToken.address===ZERO_ADDRESS){          
          setAccountBalance(Number(ethBalance))  
          setIsApproved(true)
        }else{
          if (!library) return null
          let tokenContract:Contract=getContract(fundToken?.address, ERC20_ABI, library, account ? account : ZERO_ADDRESS)
          let tokenBalance:BigNumber=await tokenContract.balanceOf(account ? account : ZERO_ADDRESS)     
          let bal=toEtherAmount(tokenBalance, fundToken, 4)                 
          setAccountBalance(bal)  
        }
      }         
    }
    return null
  }

  const onUserInput = useCallback((typedValue: string) => {
    setFundAmount(Number(typedValue))    
    setTypedValue(typedValue)
  }, [])

  const handleMax = useCallback(() => {
    // let maxAmountInput = maxAlloc
    // if (accountBalance<maxAmountInput) maxAmountInput=accountBalance
    // maxAmountInput && onUserInput(maxAmountInput.toString())
    onUserInput(maxFunding.toString())
  }, [onUserInput, maxFunding, accountBalance])

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>      
      <ContentWrapper gap="lg">
        <RowBetween>
          <CurrencyLogo currency={fundToken} size={'32px'} />
          <CloseIcon onClick={wrappedOnDismiss} />
        </RowBetween>
        <RowCenter>
          <TYPE.mediumHeader>Fund it</TYPE.mediumHeader>
        </RowCenter>
        {/* <div>                    
          <p style={{color: "#808080", fontSize: "15px", marginBottom:'0px'}}>Balance:
            <span style={{color: '#eeeeee', fontSize: '18px', margin: '0px 10px'}}>{accountBalance.toLocaleString()}</span>{fundToken?fundToken.symbol:''}</p>
        </div>  */}
        <FundingInputPanel value={typedValue} onUserInput={onUserInput} onMax={handleMax} /> 
        <HypotheticalRewardRate dim={maxAlloc?false:true}>
          <div>
            <TYPE.black fontWeight={600}>{fundToken?fundToken.symbol:''}{' '}Balance</TYPE.black>
          </div>

          <TYPE.black>
            {accountBalance?accountBalance:0}{' '}{fundToken?fundToken.symbol:''}
          </TYPE.black>
        </HypotheticalRewardRate>    
        {userInfoData && fundToken && toEtherAmount(userInfoData.fundingAmount, fundToken, 4)>0 && (<HypotheticalRewardRate dim={maxAlloc?false:true}>
          <div>
            <TYPE.black fontWeight={600}>Funded Amount</TYPE.black>
          </div>

          <TYPE.black>
            {userInfoData?toEtherAmount(userInfoData.fundingAmount, fundToken, 4):0}{' '}{fundToken?fundToken.symbol:''}
          </TYPE.black>
        </HypotheticalRewardRate>)}    
        <HypotheticalRewardRate dim={userInfoData?false:true}>
          <div>
            <TYPE.black fontWeight={600}>Multiplier</TYPE.black>
          </div>

          <TYPE.black>
            {userInfoData?userInfoData.multiplier.toNumber():0}
          </TYPE.black>
        </HypotheticalRewardRate>   
        <HypotheticalRewardRate dim={maxAlloc?false:true}>
          <div>
            <TYPE.black fontWeight={600}>Max Allocation</TYPE.black>
          </div>

          <TYPE.black>
            {maxAlloc?maxAlloc:0}{' '}{fundToken?fundToken.symbol:''}
          </TYPE.black>
        </HypotheticalRewardRate>           
        <RowBetween>
          <ButtonConfirmed
            mr="0.5rem"
            onClick={onApprove}
            confirmed={isApproved}
            disabled={!fundToken || isApproved || !accountBalance}
          >
            Approve
          </ButtonConfirmed>
          <ButtonConfirmed
            disabled={!fundToken || isFunded || !accountBalance || !isApproved}            
            confirmed={isFunded}
            onClick={onFundIt}
          >
            Fund it
          </ButtonConfirmed>
        </RowBetween>        
        <ProgressCircles steps={[isApproved]} disabled={true} />
      </ContentWrapper>
    </Modal>
  )
}
