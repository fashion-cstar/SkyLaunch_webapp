import { CloseIcon, TYPE } from '../../../theme'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
import { AutoColumn } from 'components/Column'
import { ButtonError } from 'components/Button'
import Modal from 'components/Modal'
import { RowBetween, RowCenter } from 'components/Row'
import styled from 'styled-components'
import { useTransactionAdder } from 'state/transactions/hooks'
import { BigNumber } from 'ethers'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ZERO_ADDRESS } from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { useSubscribeCallback, useNFTOwnerByIndex, useAddTxRevertedToast, useUserMultiplier } from 'state/fundraising/hooks'
import { useHistory } from 'react-router'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const LinkStakingPage = styled.div`
  text-decoration: underline;
  cursor: pointer;
  color: #aaaaee;
  font-size: 15px;
  margin-top: 10px;
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
  const { NFTOwnerByIndexCallback } = useNFTOwnerByIndex(account)
  const { subscribeCallback, subscribeWithNFTCallback } = useSubscribeCallback(account)
  const { addTxRevertedToast } = useAddTxRevertedToast()
  const userMultiplier = useUserMultiplier()
  const [multiplier, setMultiplier] = useState(0)
  const history = useHistory()

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
    if (userMultiplier) {
      try {
        setMultiplier(userMultiplier.toNumber())
      } catch (ex) {

      }
    }
  }, [userMultiplier])

  useEffect(() => {
    NFTOwnerByIndexCallback()
      .then(tokenId => {
        if (tokenId) {
          setNFTTokenId(tokenId)
        }
      })
      .catch(error => {
        setNFTTokenId(-1)
      })
  }, [])

  async function onSubscribe() {
    try {
      setAttempting(true)
      const claim = kyc_addresses.kycRecords[account ? account : ZERO_ADDRESS];
      subscribeCallback(pid, claim).then((hash: string) => {
        if (hash) {
          setHash(hash)
          resetIsSubscribe(true)
        } else {
          setAttempting(false)
        }
      }).catch(error => {
        setAttempting(false)
        let err: any = error
        if (err?.message) addTxRevertedToast(err?.message)
        if (err?.error) {
          if (err?.error?.message) addTxRevertedToast(err?.error?.message)
        }
        wrappedOnDismiss()
      })
    } catch (error) {
      setAttempting(false)
      console.log(error)
    }
  }

  async function onSubscribeNFT() {
    try {
      setAttempting(true)
      const claim = kyc_addresses.kycRecords[account ? account : ZERO_ADDRESS];
      subscribeWithNFTCallback(pid, claim, NFTTokenId).then((hash: string) => {
        if (hash) {
          setHash(hash)
          resetIsSubscribe(true)
        } else {
          setAttempting(false)
        }
      }).catch(error => {
        setAttempting(false)
        let err: any = error
        if (err?.message) addTxRevertedToast(err?.message)
        if (err?.error) {
          if (err?.error?.message) addTxRevertedToast(err?.error?.message)
        }
        wrappedOnDismiss()
      })
    } catch (error) {
      setAttempting(false)
      console.log(error)
    }
  }

  const handleSubscribe = () => {
    if (subscribeType === 1) onSubscribe()
    else onSubscribeNFT()
  }

  const handleGotoStaking = () => {
    history.push(`/stake`)
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Subscribe</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {multiplier > 0 && (
            <RowCenter>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={subscribeType}
                onChange={handleChange}
              >
                <FormControlLabel value={1} control={<Radio />} label="Subscribe" />
                <FormControlLabel value={2} control={<Radio />} label="Subscribe with Utility NFT" disabled={NFTTokenId === -1} />
              </RadioGroup>
            </RowCenter>
          )}
          {multiplier <= 0 && (
            <div>
              <TYPE.black>
                Your Score is 0
              </TYPE.black>
              <LinkStakingPage onClick={handleGotoStaking}>
                Simply stake our tokens to build up your score
              </LinkStakingPage>
            </div>
          )}
          <ButtonError onClick={handleSubscribe} disabled={multiplier > 0 ? false : true}>
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
