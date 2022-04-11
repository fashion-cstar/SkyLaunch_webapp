import React, { memo, useState, useCallback, useEffect } from 'react'
import { UserInfo } from 'state/fundraising/actions'
import { Token } from '@skylaunch/sdk'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import CheckedIcon from './checkedIcon'
import Tooltip from 'components/Tooltip'
import { useIsFormSent } from 'state/fundraising/hooks'
import { useHistory } from 'react-router'
import { useActiveWeb3React } from '../../../hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { FIXED_FUNDING_DECIMALS } from 'constants/index'
import { fundingAmountGteMaxAlloc, fundingAmountLtMaxAlloc } from 'utils/compareFundingAlloc'

interface FundRaisingButtonsProps {
    isKYCed: boolean,
    isSubscribed: boolean,
    progressPhase: number,
    fundToken: Token | undefined,
    userInfoData: UserInfo,
    maxAlloc: BigNumber,
    idoURL: string,
    openSubscribeModal: () => void,
    openFundModal: () => void,
    openClaimModal: () => void
}

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
}: FundRaisingButtonsProps) => {
    const { library, account, chainId } = useActiveWeb3React()
    const [tooltipShow, setTooltipShow] = useState<boolean>(false)    
    const [userId, setUserId] = useState<string | undefined | null>()
    const isFormSent = useIsFormSent()
    const history = useHistory()
    const handleKYCClick = useCallback(() => history.push(`/launchpad/${idoURL}/kyc`), [history]);

    useEffect(() => {
        if (account){
            setUserId(localStorage.getItem('userId'))
        }else{
            setUserId(undefined)
        }
    }, [account])
    
    return (
        <>
            {isKYCed && !isSubscribed && progressPhase === 1 && (<ButtonSecondary width="120px" padding="7px 20px" onClick={openSubscribeModal}>SUBSCRIBE</ButtonSecondary>)}
            {isKYCed && isSubscribed && progressPhase === 1 &&
                (<>
                    <Tooltip text="You already subscribed!" show={tooltipShow}>
                        <ButtonSecondary width="120px" padding="7px 20px" marginLeft={"45px"} disabled onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>SUBSCRIBE</ButtonSecondary>
                    </Tooltip>
                    <CheckedIcon color="#dddddd" />
                </>)}
            {!isKYCed && progressPhase <= 1 && (
                <ButtonPrimary width="120px" padding="7px 20px" onClick={handleKYCClick} disabled={!userId || isFormSent}>{isFormSent ? 'In Progress' : 'KYC'}</ButtonPrimary>
            )}
            {(isSubscribed && progressPhase === 2 && fundToken && maxAlloc) ?
                <>
                    {fundingAmountLtMaxAlloc(userInfoData.fundingAmount, maxAlloc, fundToken.decimals, FIXED_FUNDING_DECIMALS) && (
                        <ButtonPrimary width="120px" padding="7px 20px" onClick={openFundModal} >FUND IT!</ButtonPrimary>)}

                    {fundingAmountGteMaxAlloc(userInfoData.fundingAmount, maxAlloc, fundToken.decimals, FIXED_FUNDING_DECIMALS) && maxAlloc.gt(0) && (<>
                        <Tooltip text="You already reached your maximum allocation!" show={tooltipShow}>
                            <ButtonPrimary width="120px" padding="7px 20px" marginLeft={"45px"} disabled={true} onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>FUND IT!</ButtonPrimary>
                        </Tooltip><CheckedIcon color="#dddddd" /></>)}
                </> : <></>}
            {isSubscribed && progressPhase === 5 &&
                (
                    <ButtonPrimary width="160px" padding="7px 20px" onClick={openClaimModal} onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>
                        CLAIM REWARD
                    </ButtonPrimary>
                )}

        </>
    )
}

export default memo(FundRaisingButtons)