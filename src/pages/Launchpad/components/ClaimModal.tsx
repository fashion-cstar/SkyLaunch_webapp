import { CloseIcon, TYPE } from '../../../theme'
import { LoadingView, SubmittedView } from 'components/ModalViews'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
import { AutoColumn } from 'components/Column'
import { ButtonError } from 'components/Button'
import Modal from 'components/Modal'
import { RowBetween } from 'components/Row'
import styled from 'styled-components'
import { UserInfo, PoolInfo, setUserInfo } from 'state/fundraising/actions'
import { useActiveWeb3React } from '../../../hooks'
import parseEther from 'utils/parseEther'
import formatEther from 'utils/formatEther'
import { Token } from '@skylaunch/sdk'
import { Contract } from '@ethersproject/contracts'
import { BigNumber } from 'ethers'
import { useClaimCallback, useAddTxRevertedToast, usePendingRewards } from 'state/fundraising/hooks'
import { useAddPopup } from 'state/application/hooks'

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
  userInfoData: UserInfo,
  fundToken: Token | undefined,
  rewardToken: Token | undefined,
  onDismiss: () => void
  resetCollectedRewards: (amount: BigNumber) => void
}

export default function ClaimModal({ isOpen, pid, userInfoData, fundToken, rewardToken, onDismiss, resetCollectedRewards }: ClaimModalProps) {

  const { library, account, chainId } = useActiveWeb3React()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [claimedPending, setClaimedPending] = useState(BigNumber.from(0))
  const { claimCallback, pendingCallback } = useClaimCallback(account)
  const { addTxRevertedToast } = useAddTxRevertedToast()
  const [pendingAmount, setPending] = useState(0)
  const userPending = usePendingRewards(pid)

  useEffect(() => {
    if (userPending && rewardToken) {
      setPending(formatEther(userPending, rewardToken, 3))
    }
  }, [userPending, rewardToken])
  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    onDismiss()
  }

  const successClaiming = (pending: BigNumber) => {
    if (rewardToken) {
      let _amount = userInfoData.collectedRewards
      setClaimedPending(pending)
      resetCollectedRewards(_amount.add(pending))
    }
  }

  async function onClaimReward() {
    if (rewardToken) {
      setAttempting(true)
      try {
        pendingCallback(pid).then((pending: any) => {
          if (pending) {
            claimCallback(pid, rewardToken.symbol).then((hash: string) => {
              if (hash) {
                setHash(hash)
                successClaiming(pending)
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
          } else {
            setAttempting(false)
          }
        }).catch((error: any) => {
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
          <AutoColumn justify="center" gap="md">
            <TYPE.body fontWeight={600} fontSize={36}>
              {pendingAmount}
            </TYPE.body>
            <TYPE.body>Unclaimed {rewardToken ? rewardToken.symbol : ''}</TYPE.body>
          </AutoColumn>
          <BalanceContainer>
            {userInfoData && fundToken && formatEther(userInfoData.fundingAmount, fundToken, 2) > 0 && (<HypotheticalRewardRate dim={userInfoData.fundingAmount.gt(0) ? false : true}>
              <div>
                <TYPE.black fontWeight={600}>Funded Amount</TYPE.black>
              </div>

              <TYPE.black>
                {userInfoData ? formatEther(userInfoData.fundingAmount, fundToken, 4) : 0}{' '}{fundToken ? fundToken.symbol : ''}
              </TYPE.black>
            </HypotheticalRewardRate>)}
            {userInfoData && rewardToken && (<HypotheticalRewardRate dim={userInfoData.collectedRewards.gt(0) ? false : true}>
              <div>
                <TYPE.black fontWeight={600}>Collected Rewards</TYPE.black>
              </div>

              <TYPE.black>
                {userInfoData ? formatEther(userInfoData.collectedRewards, rewardToken, 3) : 0}{' '}{rewardToken ? rewardToken.symbol : ''}
              </TYPE.black>
            </HypotheticalRewardRate>)}
          </BalanceContainer>
          <ButtonError onClick={onClaimReward}>
            Claim
          </ButtonError>
        </ContentWrapper>
      )}
      {attempting && !hash && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.body fontSize={20}>Claiming{' pending '}{rewardToken ? rewardToken.symbol : ''}</TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {hash && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>Claimed {rewardToken ? formatEther(claimedPending, rewardToken, 3) : ''}{' '}{rewardToken ? rewardToken.symbol : ''}!</TYPE.body>
          </AutoColumn>
        </SubmittedView>
      )}
    </Modal>
  )
}
