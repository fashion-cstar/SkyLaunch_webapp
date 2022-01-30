import React, { memo, useState } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import toEtherAmount from 'utils/toEtherAmount'
import { UserInfo } from 'state/fundraising/actions'
import { Token } from '@skylaunch/sdk'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import CheckedIcon from './checkedIcon'
import { NavLink } from 'react-router-dom'
import Tooltip from 'components/Tooltip'

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
    return (
        <>            
            {isKYCed && !isSubscribed && progressPhase===1 && (<ButtonSecondary width="120px" padding="5px 20px" onClick={openSubscribeModal}>SUBSCRIBE</ButtonSecondary>)}
            {isKYCed && isSubscribed && progressPhase===1 && 
            (<>
                <Tooltip text="You already subscribed!" show={tooltipShow}>
                    <ButtonSecondary width="120px" padding="5px 20px" marginLeft={"55px"} disabled onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>SUBSCRIBE</ButtonSecondary>                    
                </Tooltip>
                <CheckedIcon color="#dddddd" />
            </>)}
            {!isKYCed && progressPhase<=1 && (<StyledNavLink id={`${idoURL}-nav-link`} to={`/launchpad/${idoURL}/kyc`}>
                <ButtonPrimary width="120px" padding="5px 20px" >KYC</ButtonPrimary>
            </StyledNavLink>)}    
            {(isSubscribed && progressPhase===2  && fundToken && maxAlloc)?
            <>
                {toEtherAmount(userInfoData.fundingAmount, fundToken, 4)<maxAlloc && (
                <ButtonPrimary width="120px" padding="5px 20px" onClick={openFundModal} >FUND IT!</ButtonPrimary>)}                   

                {toEtherAmount(userInfoData.fundingAmount, fundToken, 4)>=maxAlloc && (<>
                <Tooltip text="You already reached your maximum allocation!" show={tooltipShow}>
                    <ButtonPrimary width="120px" padding="5px 20px"  marginLeft={"55px"} disabled={true} onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>FUND IT!</ButtonPrimary>                      
                </Tooltip><CheckedIcon color="#dddddd" /></>)}                    
            </>:<></>}
            {isSubscribed && progressPhase===5 && 
            (                                    
                <ButtonPrimary width="160px" padding="5px 20px" onClick={openClaimModal} onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>
                    CLAIM REWARD
                </ButtonPrimary>             
            )}
            
        </>
    )
}

export default memo(FundRaisingButtons)