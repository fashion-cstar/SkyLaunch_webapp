import { CloseIcon, TYPE } from '../../theme'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { AutoColumn } from 'components/Column'
import { ButtonError } from 'components/Button'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import { TransactionResponse } from '@ethersproject/providers'
import styled from 'styled-components'
import { BigNumber } from 'ethers'
import { useNFTDropClaimCallback, useAddTxRevertedToast, useNFTOwnerByIndexCallback } from 'state/fundraising/hooks'
import { AppDispatch } from 'state'
import { setIsClaimedNFT } from 'state/fundraising/actions'

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
  account: string | null | undefined,
  onDismiss: () => void
}

export default function NFTClaimModal({ isOpen, account, onDismiss }: ClaimModalProps) {

  // monitor call to help UI loading state  
  const dispatch = useDispatch<AppDispatch>()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const { NFTDropClaimCallback } = useNFTDropClaimCallback(account)
  const [NFTAllocation, setNFTAllocation] = useState(10000)
  const { addTxRevertedToast } = useAddTxRevertedToast()
  const { NFTOwnerByIndexCallback } = useNFTOwnerByIndexCallback(account)

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const successClaiming = async () => {
    dispatch(setIsClaimedNFT({ isClaimedNFT: true }))
    console.log("succesNFTClaiming")
  }

  async function onNFTDropClaim() {
    if (account) {
      setAttempting(true)
      try {
        NFTDropClaimCallback(NFTAllocation).then((tx: TransactionResponse) => {
          tx.wait().then((_: any) => {
            setHash(tx.hash)
            successClaiming()
          }).catch(error => {
            setAttempting(false)
            let err: any = error
            if (err?.message) addTxRevertedToast(err?.message)
            if (err?.error) {
              if (err?.error?.message) addTxRevertedToast(err?.error?.message)
            }
            wrappedOnDismiss()
          })
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
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.mediumHeader>Claim</TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <BalanceContainer>
            <HypotheticalRewardRate dim={NFTAllocation ? false : true}>
              <div>
                <TYPE.black fontWeight={600}>NFT Drop Alloction</TYPE.black>
              </div>
              <TYPE.black>
                {NFTAllocation >= 0 ? NFTAllocation : ''}
              </TYPE.black>
            </HypotheticalRewardRate>
          </BalanceContainer>
          <ButtonError onClick={onNFTDropClaim} disabled={NFTAllocation <= 0 ? true : false}>
            Claim
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>NFT Drop Claiming</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
