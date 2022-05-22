import { FaDiscord, FaMedium, FaTelegramPlane, FaTwitter } from 'react-icons/fa'
import { BiWorld } from 'react-icons/bi'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useActiveWeb3React } from '../../../hooks'
import { BigNumber } from '@ethersproject/bignumber'
import { ChainId } from '@skylaunch/sdk'
import { calculateGasMargin } from '../../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { Contract } from '@ethersproject/contracts'
import useInterval from '../../../hooks/useInterval'
import moment from 'moment'
import styled from 'styled-components'
import { useParams } from 'react-router'
import { IDO_LIST } from 'constants/idos'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import FundModal from './FundModal'
import SubscribeModal from './SubscribeModal'
import ClaimModal from './ClaimModal'
import NewStepper from 'components/NewStepper'
import useCurrentBlockTimestamp from '../../../hooks/useCurrentBlockTimestamp'
import { ZERO_ADDRESS, FIXED_FUNDING_DECIMALS } from '../../../constants'
import { Token } from '@skylaunch/sdk'
import { getContract } from '../../../utils'
import formatEther from 'utils/formatEther'
import { useFundRaisingContract, useSkyNFTContract } from '../../../hooks/useContract'
import FundRaisingButtons from './FundRaisingButtons'
import RemainingTimePanel from './RemainingTimePanel'
import UserInfoPanel from './UserInfoPanel'
import Circle from '../../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from '../../../theme'
import { PoolInfo, UserInfo } from 'state/fundraising/actions'
import { usePoolAndUserInfoCallback, useFundAndRewardTokenCallback, useMaxAllocCallback, getProgressPhase, useKYCStatus } from 'state/fundraising/hooks'
import ERC20_ABI from 'constants/abis/erc20.json'
import { MaxUint256 } from '@ethersproject/constants'
import { NETWORK_LABELS, NETWORK_NAMES } from 'utils/getNetworkDetails'
import BlockchainLogo from 'components/BlockchainLogo'

const BgWrapper = styled.div`  
  padding: 30px 60px;
  width: 100%;  
  border-radius: 15px;
  ${({ theme }) => theme.mediaWidth.upToSmall`  
    padding: 30px 20px;
  `};
`
const HeaderContent = styled.div`
  display: flex;  
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToSmall`  
    flex-direction: column;
    align-items: center;
  `};
`
const ListSection = styled.ul`
  font-size: 14px;
  color: #b0b0b0;
  line-height: 1.4;
  font-weight: 200;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;  
  `};
`
const Heading = styled.div`
  margin: 1rem 0;
  font-weight: 500;
  font-size: 20px;
  text-transform: uppercase;
  ${({ theme }) => theme.mediaWidth.upToSmall`  
    text-align: center;
  `};
`
const Summary = styled.div`
  margin-bottom: 2rem;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 200;
  color: #c1c1c1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    text-align: center;
  `};
`
const RequirementsSummary = styled.div`
  font-size: 14px;
  line-height: 1.4;
  font-weight: 200;
  color: #c1c1c1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 12px;
    text-align: center;
  `};
`
const SocialLinks = styled.div`
  display: flex;  
`
const SocialIcon = styled.div`
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  position: relative;
  padding: 0.4rem;
  justify-content: center;
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`
const Tooltip = styled.div`
  cursor: pointer;
  font-size: 0.8rem;
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
`
const SeedContent = styled.div`  
  padding-top:8px;
  text-transform: uppercase;
`
const SeedTitle = styled.div`
  font-weight: 600;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
  `};
`
const SeedInfo = styled.div`
  margin-top: 10px;
  font-weight: 300;
  font-size: 16px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    text-align: center;
  `};
`
const SeedSection = styled.div`
  display: flex;
  flex-wrap: wrap;  
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    flex-direction: column;
  `};
`
const SeedItem = styled.div`
  width: 20%;
  margin-right: 5%;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-top: 20px;
    width: 80%;
    display: flex;
    margin-right: 0;
    justify-content: space-between;
    align-items: center;
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    width: 100%;    
  `};
`
const SeedItemTitle = styled.p`
  display: flex;
  align-items: flex-end;
  height: 50px;
  margin: 0;
  font-weight: 500;  
  font-size: 12px;
  color: #c0c0c0;
  ${({ theme }) => theme.mediaWidth.upToSmall`    
    width: 100%;
    display: block;
    height: auto;
  `};
`
const SeedItemValue = styled.p`
  margin: 15px 0px;
  color: #fff;
  font-size: 18px;
  font-weight: 500;  
  ${({ theme }) => theme.mediaWidth.upToSmall`    
    margin: 0;
  `};
`
const ButtonsGroup = styled.div`
  display: flex;
`
const LinksGroupContainer = styled.div`
  display: flex;
  justify-content: center;  
`
const LinksGroupContent = styled.div`
  display: flex;
  flex-direction: column;  
  align-items: start;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    align-items: center;
  `};
`
const ComponentBoxContainer = styled.div`  
  display: flex;
  justify-content: space-between;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
    justify-content: center;
    align-items: center;
  `};
`
const ProgressContainer = styled.div`
  display: flex;  
  justify-content: center;
  align-items: start;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin-top: 30px;
    flex-direction: column;    
    align-items: center;
  `};
`
const StepperContainer = styled.div`
  position: relative;
  padding: 15px 20px;
  background: #000000;
  border-radius: 20px;  
  &:before {
    content:"";
    position:absolute;
    top:0;
    left:0;
    right:0;
    bottom:0;
    border-radius: 20px; 
    padding: 2px; 
    background: linear-gradient(to right, #79E295, #349F9C); 
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out; 
    mask-composite: exclude; 
  }
  .MuiStepLabel-label.Mui-completed {
    color: white !important;    
    font-size: 12px;
  }
  .MuiStepLabel-label.Mui-active {
    color: #bdbdbd !important;    
    font-size: 12px;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
      // margin-top: 20px;
  `};
  
  ${({ theme }) => theme.mediaWidth.upToSmall`
      padding: 15px 5px;
  `};

`
const StepperContainerLabel = styled.span`
  display: inline-block;
  font-size: 16px;  
  font-weight: 400;
  color: white;
  padding-bottom: 15px;
  padding-left: 5px;
`
const CenterWrap = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 1rem 0;
`
const FundButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0px 20px 20px 0px; 
  ${({ theme }) => theme.mediaWidth.upToLarge`
    margin: 0px 0px 20px 0px;
`}; 
`
const SkyFiLink = styled.a`
  font-weight: 300;
  font-size: 16px;
  color: #fff;
  text-decoration: none;
  text-transform: uppercase;
`

export default function DetailComponent() {
  const { idoURL } = useParams<{ idoURL: string }>()
  const [idoData, setIdoData] = useState<any>()
  const { library, account, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const testNFTContract = useSkyNFTContract()
  const [showSubscribeModal, setShowSubscribeModal] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [pid, setPid] = useState(-1)
  const [remainSecs, setRemainSecs] = useState(0);
  const [readyFundRaising, setReadyFundRaising] = useState(false)
  const [fundToken, setFundToken] = useState<Token | undefined>()
  const [rewardToken, setRewardToken] = useState<Token | undefined>()
  const blockTimestamp = useCurrentBlockTimestamp()
  const [poolInfoData, setPoolInfoData] = useState<PoolInfo | undefined>()
  const [userInfoData, setUserInfoData] = useState<UserInfo | undefined>()
  const [countsOfPool, setCountsOfPool] = useState(0)
  const [maxAlloc, setMaxAlloc] = useState<BigNumber>(BigNumber.from(0))
  const { isKYCed, kyc_addresses } = useKYCStatus()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isFunded, setIsFunded] = useState(false)
  const [progressPhase, setProgressPhase] = useState(0)
  const { poolInfoCallback, userInfoCallback, countsOfPoolCallback } = usePoolAndUserInfoCallback()
  const { fundTokenCallback, rewardTokenCallback } = useFundAndRewardTokenCallback(account)
  const { maxAllocCallback } = useMaxAllocCallback()

  const updateCallback = useCallback(() => {
    setRemainSecs(remainSecs - 1)
  }, [remainSecs])
  useInterval(updateCallback, remainSecs > 0 ? 1000 : null)

  useEffect(() => {
    if (account) {
      countsOfPoolCallback().then(res => {
        setCountsOfPool(res)
      }).catch(error => { setCountsOfPool(0) })
    }
  }, [account])

  useEffect(() => {
    if (pid >= 0 && pid < countsOfPool) {
      poolInfoCallback(pid)
        .then(poolInfo => {
          if (poolInfo) setPoolInfoData(poolInfo)
          else setPoolInfoData(undefined)
        })
        .catch(error => {
          setPoolInfoData(undefined)
        })
    }
  }, [pid, countsOfPool, account])

  const readUserInfoData = () => {
    userInfoCallback(pid)
      .then(userInfo => {
        if (userInfo) setUserInfoData(userInfo)
        else setUserInfoData(undefined)
      })
      .catch(error => {
        setUserInfoData(undefined)
      })
  }

  useEffect(() => {
    if (pid >= 0 && pid < countsOfPool && account) {
      readUserInfoData()
    }
  }, [pid, countsOfPool, account])

  useEffect(() => {
    if (poolInfoData) {
      fundTokenCallback(poolInfoData.fundRaisingToken).then(fundToken => {
        if (fundToken) setFundToken(fundToken)
      }).catch(error => {
        setFundToken(undefined)
      })
      rewardTokenCallback(poolInfoData.rewardToken).then(rewardToken => {
        if (rewardToken) setRewardToken(rewardToken)
      }).catch(error => {
        setRewardToken(undefined)
      })
    }
  }, [poolInfoData])

  const checkSubscribed = (userInfo: UserInfo) => {
    if (userInfo['multiplier'].gt(BigNumber.from(0)) || userInfo['nftValue'].gt(BigNumber.from(0))) return true
    else return false
  }

  useEffect(() => {
    if (userInfoData && kyc_addresses) {
      if (checkSubscribed(userInfoData)) setIsSubscribed(true)
      else setIsSubscribed(false)
      if (userInfoData['fundingAmount'].gt(BigNumber.from(0))) setIsFunded(true)
      else setIsFunded(false)
    }
  }, [userInfoData, kyc_addresses, isKYCed])

  async function setupVestingRewards() {
    if (fundRaisingContract && library && fundToken && kyc_addresses) {
      try {
        const claim = kyc_addresses.kycRecords[account ? account : ZERO_ADDRESS];
        let _pid = 6
        let rewardAmount = await fundRaisingContract.getRequiredRewardAmountForAmountRaised(_pid)
        let useExact = false
        let tokenContract: Contract = getContract("0x1259DC2949DBA66a9A9dE7C5f36341e9D8357Fa0", ERC20_ABI, library, account ? account : undefined)

        let estimatedGas = await tokenContract.estimateGas.approve(fundRaisingContract.address, MaxUint256).catch(() => {
          useExact = true
          return tokenContract.estimateGas.approve(fundRaisingContract.address, rewardAmount)
        })

        let gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas

        await tokenContract.approve(fundRaisingContract.address, useExact ? rewardAmount : MaxUint256, {
          gasLimit: calculateGasMargin(gas)
        })
          .then((response: TransactionResponse) => {
            console.log(response)
          })
          .catch((error: Error) => {
            console.debug('Failed to approve token', error)
          })
        useExact = false
        estimatedGas = await fundRaisingContract.estimateGas.setupVestingRewards(_pid, rewardAmount, BigNumber.from(Math.floor(Date.now() / 1000) + 120), BigNumber.from(Math.floor(Date.now() / 1000) + 120), BigNumber.from(1647273016)).catch(() => {
          useExact = true
          return fundRaisingContract.estimateGas.setupVestingRewards(_pid, rewardAmount, BigNumber.from(Math.floor(Date.now() / 1000) + 120), BigNumber.from(Math.floor(Date.now() / 1000) + 120), BigNumber.from(1647273016))
        })
        gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas
        fundRaisingContract.setupVestingRewards(_pid, rewardAmount, BigNumber.from(Math.floor(Date.now() / 1000) + 120), BigNumber.from(Math.floor(Date.now() / 1000) + 120), BigNumber.from(1647273016), {
          gasLimit: calculateGasMargin(gas)
        })
          .then((response: TransactionResponse) => {
            console.log(response)
          })
          .catch((error: Error) => {
            console.debug('Failed to setupVestingRewards', error)
          })
      } catch (error) {
        console.debug('Failed to setupVestingRewards', error)
      }
    }
  }

  const updateProgressAndRemainTime = (blockTime: BigNumber, realBlockTime: boolean) => {
    if (blockTime && poolInfoData) {
      const res = getProgressPhase(poolInfoData, blockTime)
      if ((Number(res.progressPhase) != progressPhase || remainSecs === 0) && res.remainSecs > 0) {
        setRemainSecs(Number(res.remainSecs))
      }
      setProgressPhase(Number(res.progressPhase))
      if (res.loaded) setReadyFundRaising(true)
      let step = res.progressPhase
      if (step >= 3) step--
      setActiveStep(step)
    }
  }

  useEffect(() => {
    if (poolInfoData && userInfoData && fundToken && pid >= 0 && isSubscribed) {
      maxAllocCallback(pid)
        .then(maxalloc => {
          if (maxalloc) setMaxAlloc(maxalloc)
          else setMaxAlloc(BigNumber.from(0))
        })
        .catch((error: any) => {
          console.log(error)
          setMaxAlloc(BigNumber.from(0))
        })
    }
    if (pid >= 0 && poolInfoData && userInfoData) updateProgressAndRemainTime(BigNumber.from(Math.floor(Date.now() / 1000)), false)
  }, [poolInfoData, userInfoData, fundToken, pid, isSubscribed])

  useEffect(() => {
    if (blockTimestamp && pid >= 0) {
      updateProgressAndRemainTime(blockTimestamp, true)
    }
  }, [blockTimestamp, pid])

  useEffect(() => {
    if (!poolInfoData && !userInfoData) {
      setIdoData(IDO_LIST.find(item => item.idoURL === idoURL))
    }
  }, [idoURL, poolInfoData, userInfoData])

  useEffect(() => {
    if (idoData) {
      setPid(idoData.pid)
    }
  }, [idoData])

  const goToSite = (str: string) => {
    window.open(str, '_blank')
  }

  const socialMediaLinks = useMemo<Array<{ type: string; url: string; icon: any }>>(() => {
    if (idoData?.socials) {
      return idoData.socials.map((social: { type: string; url: string }) => {
        let icon = <BiWorld />
        if (social.type === 'WEBSITE') icon = <BiWorld />
        else if (social.type === 'TELEGRAM') icon = <FaTelegramPlane />
        else if (social.type === 'TWITTER') icon = <FaTwitter />
        else if (social.type === 'DISCORD') icon = <FaDiscord />
        else if (social.type === 'MEDIUM') icon = <FaMedium />

        return {
          type: social.type,
          url: social.url,
          icon
        }
      })
    }
    return []
  }, [idoData])

  const resetCollectedRewards = () => {
    readUserInfoData()
  }

  const resetIsSubscribe = () => {
    readUserInfoData()
  }

  const resetFundState = () => {
    readUserInfoData()
  }

  const openSubscribeModal = () => {
    setShowSubscribeModal(!showSubscribeModal)
  }
  const openFundModal = () => {
    setShowFundModal(!showFundModal)
  }

  const openClaimModal = async () => {
    if (rewardToken) {
      try {
        setShowClaimModal(!showClaimModal)
      } catch (error) {
        console.log(error)
      }
    }
  }

  return (
    <>
      <BgWrapper>
        <div>
          <Heading>Staking Requirements</Heading>
          <HeaderContent>
            <div>
              <RequirementsSummary>
                To get involved in project staking, please make sure you have completed the following requirements:
              </RequirementsSummary>
              <ListSection>
                <li>Connect your wallet and have the required network, <span style={{ color: '#FFF' }}>Binance Smart Chain</span> selected.</li>
                <li>Create a free account and <span style={{ color: '#FFF' }}>Sign In</span>.</li>
                <li>Complete your <span style={{ color: '#FFF' }}>KYC and be approved</span>.</li>
              </ListSection>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: '16px' }}>
              <ButtonPrimary width="180px" padding="7px 20px">CREATE ACCOUNT</ButtonPrimary>
              <ButtonSecondary width="180px" padding="7px 20px">SIGN IN</ButtonSecondary>
            </div>
          </HeaderContent>
        </div>
        <hr style={{ width: '100%', border: '1px solid #808080', margin: '20px 0px' }} />
        <div>
          <HeaderContent>
            <Heading>Project Summary</Heading>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <SkyFiLink href={idoData?.siteUrl} target="_blank">{idoData?.siteUrl}</SkyFiLink>
              <SocialLinks>
                {socialMediaLinks.map(iconDetails => (
                  <SocialIcon key={iconDetails.url} onClick={() => window.open(iconDetails.url)}>
                    {iconDetails.icon}
                    <Tooltip className="tooltip">{iconDetails.type}</Tooltip>
                  </SocialIcon>
                ))}
              </SocialLinks>
            </div>
          </HeaderContent>
          <Summary>
            {idoData?.description ?? ''}
          </Summary>
        </div>
        {poolInfoData && userInfoData && isKYCed && !isSubscribed && testNFTContract && progressPhase == 1 && (<SubscribeModal
          isOpen={showSubscribeModal} onDismiss={() => setShowSubscribeModal(false)}
          pid={pid} kyc_addresses={kyc_addresses} resetIsSubscribe={resetIsSubscribe} />)}

        {poolInfoData && userInfoData && isSubscribed && progressPhase == 2 && (<FundModal
          isOpen={showFundModal} onDismiss={() => setShowFundModal(false)} resetFundState={resetFundState}
          pid={pid} userInfoData={userInfoData} fundToken={fundToken} />)}

        {poolInfoData && userInfoData && isFunded && (<ClaimModal resetCollectedRewards={resetCollectedRewards}
          isOpen={showClaimModal} onDismiss={() => setShowClaimModal(false)}
          pid={pid} userInfoData={userInfoData} rewardToken={rewardToken} fundToken={fundToken} />)}

        {account && kyc_addresses && (
          <ComponentBoxContainer>
            {!(readyFundRaising && poolInfoData && userInfoData) ? (
              <CenterWrap>
                <CustomLightSpinner src={Circle} alt="loader" size={'90px'} />
              </CenterWrap>
            ) : (
              <>
                <LinksGroupContainer>
                  <LinksGroupContent>
                    <ButtonsGroup>
                      {idoData?.whiteListUrl && (
                        <ButtonPrimary width="140px" padding="7px 20px" onClick={() => goToSite(idoData.whiteListUrl)}>WHITEPAPER</ButtonPrimary>
                      )}
                    </ButtonsGroup>
                  </LinksGroupContent>
                </LinksGroupContainer>
                <ProgressContainer>
                  <FundButtonContainer>
                    {(poolInfoData && userInfoData) ?
                      <>
                        <FundRaisingButtons isKYCed={isKYCed} isSubscribed={isSubscribed} progressPhase={progressPhase} fundToken={fundToken} userInfoData={userInfoData} maxAlloc={maxAlloc} idoURL={idoURL} openSubscribeModal={openSubscribeModal} openFundModal={openFundModal} openClaimModal={openClaimModal} />
                      </> : <></>}
                  </FundButtonContainer>
                  <StepperContainer>
                    <StepperContainerLabel>PROGRESS</StepperContainerLabel>
                    <NewStepper activeStep={activeStep} />
                    {remainSecs > 0 && (<RemainingTimePanel secs={remainSecs} />)}
                    {isFunded && (<UserInfoPanel multiplier={userInfoData ? userInfoData.multiplier.toNumber() : 0}
                      fundingAmount={userInfoData && fundToken ? formatEther(userInfoData.fundingAmount, fundToken.decimals, FIXED_FUNDING_DECIMALS, true) : '0'}
                      collectedRewards={userInfoData && rewardToken ? formatEther(userInfoData.collectedRewards, rewardToken.decimals, 3, true) : '0'}
                      fundTokenSymbol={fundToken ? fundToken.symbol : ''}
                      rewardTokenSymbol={rewardToken ? rewardToken.symbol : ''}
                      progressPhase={progressPhase} />)}
                  </StepperContainer>
                  {/* <ButtonPrimary width="120px" padding="5px 20px" onClick={() => setupVestingRewards()}>setupVestingRewards</ButtonPrimary> */}
                </ProgressContainer>
              </>)}
          </ComponentBoxContainer>)}
        <hr style={{ width: '100%', border: '1px solid #808080', margin: '20px 0px' }} />
        <SeedContent>
          <div>
            <Heading>Seed Round</Heading>
            <SeedInfo>Seed Round Closed On {moment(idoData?.seed?.closedDate).format('lll')}</SeedInfo>
          </div>
          <SeedSection>
            <SeedItem>
              <SeedItemTitle>Token Allocation</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.tokenAllocation}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>% Of Total Tokens</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.totalTokenPercent}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Token Price</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.tokenPrice}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Total Raised</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.totalRaised}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Lockup Period</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.lockPeriod}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Vesting Period Post Lockup(M)</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.vestingPeriod}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>% At TGE</SeedItemTitle>
              <SeedItemValue>{idoData?.seed?.tgePercent}</SeedItemValue>
            </SeedItem>
            <SeedItem>
              <SeedItemTitle>Raise Network</SeedItemTitle>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <BlockchainLogo size="26px" blockchain={chainId ? NETWORK_LABELS[chainId] : 'Ethereum'} />
                <SeedItemValue>{chainId ? NETWORK_NAMES[chainId] : 'Ethereum'}</SeedItemValue>
              </div>
            </SeedItem>
          </SeedSection>
        </SeedContent>
      </BgWrapper>
    </>
  )
}