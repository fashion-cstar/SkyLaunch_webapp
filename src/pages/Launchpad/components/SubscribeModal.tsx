import { CloseIcon, TYPE } from '../../../theme'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
import { AutoColumn } from 'components/Column'
import { ButtonError } from 'components/Button'
import Modal from 'components/Modal'
import { RowBetween, RowCenter } from 'components/Row'
import { TransactionResponse } from '@ethersproject/providers'
import styled from 'styled-components'
import { useTransactionAdder } from 'state/transactions/hooks'
import { UserInfo, PoolInfo, setUserInfo, setIsSubscribed } from 'state/fundraising/actions'
import toCurrencyAmount from 'utils/toCurrencyAmount'
import toEtherAmount from 'utils/toEtherAmount'
import { calculateGasMargin } from '../../../utils'
import { Token } from '@skylaunch/sdk'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from 'ethers'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ZERO_ADDRESS } from '../../../constants'
import { ChainId } from '@skylaunch/sdk'
import { useActiveWeb3React } from '../../../hooks'
import { useSubscribeCallback, useUtilityNFTTokenId } from 'state/fundraising/hooks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const BalanceContainer = styled.div`
  margin-bottom: 20px;
`

const HypotheticalRewardRate = styled.div<{ dim: boolean }>`
  display: flex;
  justify-content: space-between;
  padding-right: 20px;
  padding-left: 20px;
  padding-top: 20px;  
  opacity: ${({ dim }) => (dim ? 0.5 : 1)};
`

interface ClaimModalProps {
    isOpen: boolean,        
    pid: number,    
    kyc_addresses: any,
    onDismiss: () => void,
    resetIsSubscribe: (value: boolean) => void
  }

export default function SubscribeModal({ isOpen, pid, kyc_addresses, onDismiss, resetIsSubscribe }: ClaimModalProps) {

  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const { library, account, chainId } = useActiveWeb3React()
  const [NFTTokenId, setNFTTokenId] = useState(-1)
  const { NFTTokenIdCallback } = useUtilityNFTTokenId(account)
  const { subscribeCallback, subscribeWithNFTCallback } = useSubscribeCallback(account)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }
  const [subscribeType, setValue] = React.useState(1);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number((event.target as HTMLInputElement).value));
  };

  useEffect(() => {        
    NFTTokenIdCallback()
    .then(tokenId => {     
      console.log(tokenId)         
      if (tokenId!==undefined){        
        setNFTTokenId(tokenId)
      }      
    })      
    .catch(error => {
      setNFTTokenId(-1)
    })      
  }, [])

  async function onSubscribe() {
    try{      
      setAttempting(true)      
      const claim = kyc_addresses.kycRecords[account?account:ZERO_ADDRESS];
      subscribeCallback(pid, claim).then((hash:string) => {
        setHash(hash)
        resetIsSubscribe(true)
      }).catch(error => {
        setAttempting(false)
        console.log(error)
      })      
    }catch(error){
      setAttempting(false)
      console.log(error)
    }    
  }

  async function onSubscribeNFT() {
    try{      
      setAttempting(true)      
      const claim = kyc_addresses.kycRecords[account?account:ZERO_ADDRESS];
      subscribeWithNFTCallback(pid, claim, NFTTokenId).then((hash:string) => {
        setHash(hash)
        resetIsSubscribe(true)
      }).catch(error => {
        setAttempting(false)
        console.log(error)
      })      
    }catch(error){
      setAttempting(false)
      console.log(error)
    }
  }

  const handleSubscribe = () =>{
    if (subscribeType===1) onSubscribe()
    else onSubscribeNFT()
  }
  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
            <RowBetween>
                <TYPE.mediumHeader>Subscribe</TYPE.mediumHeader>
                <CloseIcon onClick={wrappedOnDismiss} />
            </RowBetween> 
            {/* <RowCenter>
                <TYPE.mediumHeader>Subscribe</TYPE.mediumHeader>
            </RowCenter>                 */}
            <RowCenter>
                <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={subscribeType}
                    onChange={handleChange}
                >
                    <FormControlLabel value={1} control={<Radio />} label="Subscribe" />
                    <FormControlLabel value={2} control={<Radio />} label="Subscribe with Utility NFT" disabled={NFTTokenId===-1} />
                </RadioGroup>
            </RowCenter>
            <ButtonError onClick={handleSubscribe}>
                Subscribe
            </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Subscribing</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Subscribed!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
