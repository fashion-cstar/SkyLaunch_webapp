import React, { memo } from 'react'
import moment from 'moment'
import styled from 'styled-components'
import toEtherAmount from 'utils/toEtherAmount'
import { UserInfo } from 'state/fundraising/actions'
import { Token } from '@skylaunch/sdk'

interface NoteTextProps {
    isKYCed: boolean,
    isSubscribed: boolean,
    isFunded: boolean,
    progressPhase: number,
    fundToken: Token | undefined,
    userInfoData: UserInfo,
    maxAlloc: number
}

const ProgressDescription = styled.p`
    font-size: 14px;
    font-weight: 600;
    color: #a7b1f4;
    text-align: right;
    margin: 10px 0px;
    ${({ theme }) => theme.mediaWidth.upToLarge`
        margin-top: 30px;
    `};
    `

const NoteTextBar = ({
    isKYCed, 
    isSubscribed, 
    isFunded, 
    progressPhase,
    fundToken,
    userInfoData,
    maxAlloc
    }: NoteTextProps) => {

    return (
        <>
            {!isKYCed && progressPhase<=1 && (<ProgressDescription>You are not KYCed! Click KYC button to register!</ProgressDescription>)}
            {isSubscribed && progressPhase<=1 && (<ProgressDescription>You already subscribed!</ProgressDescription>)}
            {isSubscribed && isFunded && progressPhase===2 && fundToken && toEtherAmount(userInfoData.fundingAmount, fundToken, 4)<maxAlloc && (<ProgressDescription>You funded. To fund more, click FUND IT button!</ProgressDescription>)}
            {isSubscribed && isFunded && progressPhase===2 && fundToken && toEtherAmount(userInfoData.fundingAmount, fundToken, 4)>=maxAlloc && (<ProgressDescription>You have already reached your maximum allocation!</ProgressDescription>)}
            {isSubscribed && !isFunded && progressPhase===2 && (<ProgressDescription>You already subscribed! Click FUND IT button to stake!</ProgressDescription>)}
            {isKYCed && !isSubscribed && progressPhase<=1 && (<ProgressDescription>You already KYCed! Click SUBSCRIBE button to subscribe!</ProgressDescription>)}
            {!isSubscribed && progressPhase>=2 && (<ProgressDescription>You are not a subscriber!</ProgressDescription>)} 
            {isSubscribed && progressPhase===3 && isFunded && (<ProgressDescription>You funded! Distributing is not started!</ProgressDescription>)} 
            {isSubscribed && progressPhase>=4 && !isFunded && (<ProgressDescription>You did not fund it!</ProgressDescription>)} 
            {isSubscribed && progressPhase===4 && isFunded && (<ProgressDescription>Distributing! but not pass Cliff</ProgressDescription>)} 
            {isSubscribed && progressPhase===5 && isFunded && (<ProgressDescription>Click CLAIM button to claim reward!</ProgressDescription>)} 
        </>
    )
}

export default memo(NoteTextBar)