import { FaDiscord, FaMedium, FaTelegramPlane, FaTwitter } from 'react-icons/fa'
import { BiWorld } from 'react-icons/bi'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../state'
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
import { NavLink } from 'react-router-dom'
import { ButtonPrimary, ButtonSecondary } from 'components/Button'
import { ExternalLink } from '../../../theme'
import FundModal from './FundModal'
import NewStepper from 'components/NewStepper'
import useCurrentBlockTimestamp from '../../../hooks/useCurrentBlockTimestamp'
import { ZERO_ADDRESS, NATIVE_TOKEN } from '../../../constants'
import { Token } from '@skylaunch/sdk'
import { getContract } from '../../../utils'
import toEtherAmount from 'utils/toEtherAmount'
import { useFundRaisingContract, useTokenContract } from '../../../hooks/useContract'
import kycMerkleRoot from '../../../constants/abis/kycMerkleRoot.json';
import CheckedIcon from './checkedIcon'
import NoteTextBar from './NoteTextBar'
import RemainingTimePanel from './RemainingTimePanel'
import FundedAmountPanel from './FundedAmountPanel'
import Circle from '../../../assets/images/blue-loader.svg'
import { CustomLightSpinner } from '../../../theme'
import { setPoolInfo, setUserInfo, setIsKYCed, setIsSubscribed, setIsFunded, setProgressPhase, setPoolID, setMaxAlloc } from 'state/fundraising/actions'
import { usePoolInfoData, useUserInfoData, useUserKYCed, useUserSubscribed, useUserFunded, useProgressPhase, useMaxAlloc, getProgressPhase, extractContractPoolInfo, extractContractUserInfo } from 'state/fundraising/hooks'
import ERC20_ABI from 'constants/abis/erc20.json'
import toCurrencyAmount from 'utils/toCurrencyAmount'

const IdoDetails = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  padding: 0 40px;
`

const PoolDetails = styled.div`
  width: 100%;
`
const BgWrapper = styled.div`
  background: #1c1c1c;
  box-shadow: 0 0 5px 1px #101010;
  border-radius: 15px;
  margin-bottom: 8rem;
  margin-top: 4rem;
  padding: 30px 60px;
  width: 100%;
  position: relative;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    border-radius: 16px;
    padding: 20px;
  `};
  & > img {
    width: calc(100% + 120px);
    margin: -30px -60px 0;
  }
`
const Header = styled.div`
  text-transform: uppercase;
`
const Heading = styled.div`
  margin: 1rem 0;
`

const Summary = styled.div`
  margin-bottom: 2rem;
  font-size: 14px;
`
const SocialLinks = styled.div`
  display: flex;
  margin-top: 1rem;
`

const SocialIcon = styled.div`
  cursor: pointer;
  font-size: 1.4rem;
  display: flex;
  position: relative;
  padding: 0.4rem 0.8rem 0.4rem 0;
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
  margin-top: 50px;
  text-transform: uppercase;
`

const SeedTitle = styled.div`
  font-weight: 600;
`

const SeedInfo = styled.div`
  margin-top: 10px;
`

const SeedSection = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const SeedItem = styled.div`
  width: 20%;
  margin-right: 5%;
`

const SeedItemTitle = styled.p`
  display: flex;
  align-items: flex-end;
  height: 70px;
  margin: 0;
  font-weight: 600;
  line-height: 20px;
`

const SeedItemValue = styled.p`
  margin: 15px 0 20px;
`
const ButtonsGroup = styled.div`
  display: flex;
`
const LinksGroupContainer = styled.div`
  
`
const LinksGroupContent = styled.div`
  
`
const ComponentBoxContainer = styled.div`
  display: flex;
  justify-content: space-around;
  ${({ theme }) => theme.mediaWidth.upToLarge`
    flex-direction: column;
    justify-content: center;
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
    font-family: Poppins;
    font-size: 12px;
  }
  .MuiStepLabel-label.Mui-active {
    color: #bdbdbd !important;
    font-family: Poppins;
    font-size: 12px;
  }

  ${({ theme }) => theme.mediaWidth.upToLarge`
      margin-top: 20px;
  `};
  
  ${({ theme }) => theme.mediaWidth.upToSmall`
      padding: 15px 5px;
  `};

`
const StepperContainerLabel = styled.span`
  display: inline-block;
  font-size: 16px;
  font-family: Poppins;
  font-weight: 400;
  color: white;
  padding-bottom: 15px;
  padding-left: 5px;
`
const StyledNavLink = styled(NavLink)`
  text-decoration: none
`

const CenterWrap = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 1rem 0;
`

export default function DetailComponent() {
  const dispatch = useDispatch<AppDispatch>()
  const { idoURL } = useParams<{ idoURL: string }>()
  const [idoData, setIdoData] = useState<any>()
  const { library, account, chainId } = useActiveWeb3React()
  const fundRaisingContract = useFundRaisingContract()
  const [showFundModal, setShowFundModal] = useState(false)  
  const [activeStep, setActiveStep] = useState(0)  
  const [pid, setPid] = useState(-1)  
  const [remainSecs, setRemainSecs] = useState(0);  
  const [readyFundRaising, setReadyFundRaising] = useState(false)
  const [fundToken, setFundToken] = useState<Token | undefined>()
  const blockTimestamp = useCurrentBlockTimestamp()  
  const IdoListComplete = IDO_LIST // fetch this list from the server  
  const poolInfoData=usePoolInfoData()
  const userInfoData=useUserInfoData()
  const maxAlloc=useMaxAlloc()
  const isKYCed=useUserKYCed()
  const isSubscribed=useUserSubscribed()
  const isFunded=useUserFunded()  
  const progressPhase=useProgressPhase()
  
  const updateCallback = useCallback(() => {
    // if (remainSecs===1 && poolInfoData && fundRaisingContract && userInfoData && fundToken){
    //   updateProgressAndRemainTime(BigNumber.from(Math.floor(Date.now() / 1000)))
    // }
    setRemainSecs(remainSecs-1)
  }, [remainSecs])
  useInterval(updateCallback, remainSecs>0?1000:null)

  const fetchPoolInfo = async () => {
    if (fundRaisingContract){                        
      let numsOfPools=await fundRaisingContract.numberOfPools()
      if (!numsOfPools || pid>=numsOfPools) return null
      let poolInfo=await fundRaisingContract.poolInfo(pid)      
      dispatch(setPoolID({poolID:pid}))         
      dispatch(setPoolInfo({poolInfo:extractContractPoolInfo(poolInfo)})) 
      if (poolInfo && chainId && library){
        if (poolInfo?.fundRaisingToken===ZERO_ADDRESS){
          let token=NATIVE_TOKEN[chainId]
          setFundToken(token)
        }else{          
          let tokenContract:Contract=getContract(poolInfo?.fundRaisingToken, ERC20_ABI, library, account ? account : undefined)
          let name=await tokenContract.name()
          let symbol=await tokenContract.symbol()
          let decimals=await tokenContract.decimals()
          let token=new Token(chainId, poolInfo?.fundRaisingToken, decimals, symbol, name)
          setFundToken(token)
        }
      }     
    }
    return null
  }
  
  const fetchUserInfo = async () => {
    if (fundRaisingContract){                  
      let numsOfPools=await fundRaisingContract.numberOfPools()
      if (!numsOfPools || pid>=numsOfPools) return null
      let userInfo=await fundRaisingContract.userInfo(pid, account)      
      dispatch(setUserInfo({userInfo:extractContractUserInfo(userInfo)}))      
      const claim = kycMerkleRoot.kycRecords[account?account:ZERO_ADDRESS]
      if (claim) dispatch(setIsKYCed({isKYCed:true}))      
      else dispatch(setIsKYCed({isKYCed:false}))           
      if (userInfo){
        if (userInfo['multiplier']>0) dispatch(setIsSubscribed({isSubscribed:true}))
        else dispatch(setIsSubscribed({isSubscribed:false}))
        if (userInfo['fundingAmount']>0) dispatch(setIsFunded({isFunded:true}))
        else dispatch(setIsFunded({isFunded:false}))                
      }
    }
    return null
  }

  async function onSubscribe() {
    if (fundRaisingContract){              
      let useExact = false
      try{        
        const claim = kycMerkleRoot.kycRecords[account?account:ZERO_ADDRESS];
        const estimatedGas = await fundRaisingContract.estimateGas.subscribe(pid, claim.index, claim.proof).catch(() => {        
          useExact = true
          return fundRaisingContract.estimateGas.subscribe(pid, claim.index, claim.proof)
        })        
        const gas = chainId === ChainId.AVALANCHE || chainId === ChainId.SMART_CHAIN ? BigNumber.from(350000) : estimatedGas        
        fundRaisingContract.subscribe(pid, claim.index, claim.proof, {
          gasLimit: calculateGasMargin(gas)
        })
        .then((response: TransactionResponse) => {          
          console.log(response)
          dispatch(setIsSubscribed({isSubscribed:true}))
        })
        .catch((error: Error) => {
          console.debug('Failed to subscribe token', error)          
          // throw error
        }) 
      }catch(error){
        console.debug('Failed to subscribe', error)        
        // throw error
      }
      // fetchUserInfo()
    }
  }

  const updateProgressAndRemainTime= (blockTime:BigNumber, realBlockTime:boolean) => {
    if (blockTime && poolInfoData){
      const res=getProgressPhase(poolInfoData, blockTime)
      console.log(realBlockTime)
      if ((Number(res.progressPhase)!=progressPhase || remainSecs===0) && realBlockTime) setRemainSecs(Number(res.remainSecs))       
      dispatch(setProgressPhase({progressPhase:Number(res.progressPhase)})) 
      if (res.loaded) setReadyFundRaising(true)
      let step=res.progressPhase
      if (step>=3) step--
      setActiveStep(step)
    }
  }
  useEffect(() => {    
    if (account && pid>=0){         
      dispatch(setPoolInfo({poolInfo:null}))
      dispatch(setUserInfo({userInfo:null}))
      fetchPoolInfo()
      fetchUserInfo()                 
    }
  }, [account, pid])
  
  useEffect(() => {
    const fetch=async () => {
      if (fundRaisingContract && poolInfoData && userInfoData && fundToken){
        if (userInfoData['multiplier'].toNumber()>0){
          let maxalloc=await fundRaisingContract.getMaximumAllocation(pid)        
          if (maxalloc){                            
            dispatch(setMaxAlloc({maxAlloc:toEtherAmount(maxalloc, fundToken, 0)}))
          }else{
            dispatch(setMaxAlloc({maxAlloc:0}))
          }            
        }
      }
    }
    updateProgressAndRemainTime(BigNumber.from(Math.floor(Date.now() / 1000)), false)
    fetch()
  }, [poolInfoData, userInfoData, fundToken])

  useEffect(() => {          
    if (blockTimestamp) updateProgressAndRemainTime(blockTimestamp, true)
  }, [blockTimestamp])
  
  useEffect(() => {    
    setIdoData(IDO_LIST.find(item => item.idoURL === idoURL))
    const isIDOURL = (element:any) => element.idoURL===idoURL
    setPid(IdoListComplete.findIndex(isIDOURL))     
  }, [idoURL])

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

  const openFundModal = () => {     
    setShowFundModal(!showFundModal)
  }

  return (
    <>      
      <IdoDetails>
        <PoolDetails>
          <BgWrapper>
            <img src='/images/idos/wasder_hero.png' />
            <Header>
              <Heading>Project Summary</Heading>
              <Summary>
                {idoData?.description ?? ''}
              </Summary>
            </Header>
            {poolInfoData && userInfoData && isSubscribed && !isFunded && progressPhase==2 && (<FundModal            
            isOpen={showFundModal} onDismiss={() => setShowFundModal(false)}
            fundRaisingContract={fundRaisingContract} pid={pid} poolInfoData={poolInfoData}
            userInfoData={userInfoData} maxAlloc={maxAlloc} fundToken={fundToken}/>)}
            {(account && readyFundRaising && poolInfoData && userInfoData)?
            <>
              {!isKYCed && progressPhase<=1 && (<NoteTextBar notetext="You are not KYCed! Click KYC button to register!" type="warning" />)}
              {isSubscribed && progressPhase<=1 && (<NoteTextBar notetext="You already subscribed!" type="success" />)}
              {isSubscribed && isFunded && progressPhase===2 && (<NoteTextBar notetext="You already funded!" type="success" />)}
              {isSubscribed && !isFunded && progressPhase===2 && (<NoteTextBar notetext="You already subscribed! Click FundIt button to stake!" type="warning" />)}
              {isKYCed && !isSubscribed && progressPhase<=1 && (<NoteTextBar notetext="You already KYCed! Click Subscribe button to subscribe!" type="warning" />)}
              {!isSubscribed && progressPhase>=2 && progressPhase<=4 && (<NoteTextBar notetext="You are not a subscriber!" type="warning" />)} 
            </>             
              :<></>}
            {account && (
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
                          <ButtonPrimary width="120px" padding="5px 20px" onClick={() => goToSite(idoData.whiteListUrl)}>WHITEPAPER</ButtonPrimary>
                        )}         
                        {poolInfoData && userInfoData && isKYCed && progressPhase===1 && (<ButtonSecondary width="120px" padding="5px 5px" marginLeft="40px" onClick={onSubscribe} disabled={isSubscribed?true:false}>SUBSCRIBE</ButtonSecondary>)}
                        {poolInfoData && userInfoData && isKYCed && isSubscribed && progressPhase===1 && (<CheckedIcon color="#dddddd" />)}
                        {poolInfoData && userInfoData && !isKYCed && progressPhase<=1 && (<StyledNavLink id={`${idoURL}-nav-link`} to={`/launchpad/${idoURL}/kyc`}>
                          <ButtonPrimary width="120px" padding="5px 5px" marginLeft="40px" >KYC</ButtonPrimary>
                        </StyledNavLink>)}    
                        {poolInfoData && userInfoData && isSubscribed && progressPhase==2 && (
                          <ButtonPrimary width="120px" padding="5px 5px" marginLeft="40px" onClick={openFundModal} disabled={isFunded?true:false}>Fund it!</ButtonPrimary>)}                   
                        {poolInfoData && userInfoData && isSubscribed && isFunded && progressPhase===2 && (<CheckedIcon color="#dddddd" />)}
                      </ButtonsGroup>                      
                      <SocialLinks>
                        {socialMediaLinks.map(iconDetails => (
                          <SocialIcon key={iconDetails.url} onClick={() => window.open(iconDetails.url)}>
                            {iconDetails.icon}
                            <Tooltip className="tooltip">{iconDetails.type}</Tooltip>
                          </SocialIcon>
                        ))}
                      </SocialLinks>
                      <ExternalLink href={idoData?.siteUrl}>{idoData?.siteUrl}</ExternalLink>
                    </LinksGroupContent>
                  </LinksGroupContainer>
                  <StepperContainer>
                    <StepperContainerLabel>PROGRESS</StepperContainerLabel>
                    <NewStepper activeStep={activeStep} />
                    {!isFunded?<RemainingTimePanel secs={remainSecs} />:
                    <FundedAmountPanel multiplier={userInfoData?userInfoData.multiplier.toNumber():0}
                                       fundingAmount={userInfoData && fundToken?toEtherAmount(userInfoData.fundingAmount, fundToken, 3):0}
                                       symbol={fundToken?fundToken.symbol:''} />}
                  </StepperContainer>
                </>)}
            </ComponentBoxContainer>)}
            <SeedContent>
              <SeedTitle>Seed Round</SeedTitle>
              <SeedInfo>Seed Round Closed On {moment(idoData?.seed?.closedDate).format('lll')}</SeedInfo>
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
              </SeedSection>
            </SeedContent>
          </BgWrapper>
        </PoolDetails>
      </IdoDetails>
    </>
  )
}