import React, { memo, useState, useCallback } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import formatEther from 'utils/formatEther'
import { UserInfo } from 'state/fundraising/actions'
import { Token } from '@skylaunch/sdk'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import CheckedIcon from './checkedIcon'
import { NavLink } from 'react-router-dom'
import Tooltip from 'components/Tooltip'
import { useUserId, useIsFormSent } from 'state/fundraising/hooks'
import { useHistory } from 'react-router'

interface NoteTextProps {
    isKYCed: boolean,
    isSubscribed: boolean,
    progressPhase: number,
    fundToken: Token | undefined,
    userInfoData: UserInfo,
    maxAlloc: number,
    idoURL: string,
    openSubscribeModal: () => void,
    openFundModal: () => void,
    openClaimModal: () => void
}

const StyledNavLink = styled(NavLink)`
  text-decoration: none
`

const FundRaisingButtons = ({
    isKYCed,
    isSubscribed,
    progressPhase,
    fundToken,
    userInfoData,
    maxAlloc,
    idoURL,
    openSubscribeModal,
    openFundModal,
    openClaimModal
}: NoteTextProps) => {
    const [tooltipShow, setTooltipShow] = useState<boolean>(false)
    const userId = useUserId()
    const isFormSent = useIsFormSent()
    const history = useHistory()
    const handleKYCClick = useCallback(() => history.push(`/launchpad/${idoURL}/kyc`), [history]);

    return (
        <>
            {isKYCed && !isSubscribed && progressPhase === 1 && (<ButtonSecondary width="120px" padding="5px 20px" onClick={openSubscribeModal}>SUBSCRIBE</ButtonSecondary>)}
            {isKYCed && isSubscribed && progressPhase === 1 &&
                (<>
                    <Tooltip text="You already subscribed!" show={tooltipShow}>
                        <ButtonSecondary width="120px" padding="5px 20px" marginLeft={"55px"} disabled onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>SUBSCRIBE</ButtonSecondary>
                    </Tooltip>
                    <CheckedIcon color="#dddddd" />
                </>)}
            {!isKYCed && progressPhase <= 1 && (
                <ButtonPrimary width="120px" padding="5px 20px" onClick={handleKYCClick} disabled={!userId || isFormSent}>{isFormSent ? 'In Progress' : 'KYC'}</ButtonPrimary>
            )}
            {(isSubscribed && progressPhase === 2 && fundToken && maxAlloc) ?
                <>
                    {formatEther(userInfoData.fundingAmount, fundToken, 4) < maxAlloc && (
                        <ButtonPrimary width="120px" padding="5px 20px" onClick={openFundModal} >FUND IT!</ButtonPrimary>)}

                    {formatEther(userInfoData.fundingAmount, fundToken, 4) >= maxAlloc && (<>
                        <Tooltip text="You already reached your maximum allocation!" show={tooltipShow}>
                            <ButtonPrimary width="120px" padding="5px 20px" marginLeft={"55px"} disabled={true} onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>FUND IT!</ButtonPrimary>
                        </Tooltip><CheckedIcon color="#dddddd" /></>)}
                </> : <></>}
            {isSubscribed && progressPhase === 5 &&
                (
                    <ButtonPrimary width="160px" padding="5px 20px" onClick={openClaimModal} onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>
                        CLAIM REWARD
                    </ButtonPrimary>
                )}

        </>
    )
}

export default memo(FundRaisingButtons)