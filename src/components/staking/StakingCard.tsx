import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import Row from 'components/Row'
import BubbleBase from './../BubbleBase'
import { ChevronDown } from 'react-feather'
import MetaMaskIcon from '../../assets/images/metamask-icon.svg'
import OutsideLink from '../../assets/images/outside-link.svg'
import { ButtonOutlined, ButtonPrimary, ButtonSecondary } from './../Button'
import QuestionHelper from './../QuestionHelper'
import Tooltip from './../Tooltip'
import Icon from './../Icon'
import { StakingRoiModal } from './index'
import { Slider } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles';
import { StakingInfo } from 'state/stake/hooks'

import StakingModal from 'components/pools/StakingModal'
import { useActiveWeb3React } from 'hooks'
import { useWalletModalToggle } from 'state/application/hooks'
import { getEtherscanLink } from 'utils'
import { Token, TokenAmount } from '@skylaunch/sdk'
import { useTokenBalance } from 'state/wallet/hooks'
import { getCurrencyLogoImage } from 'components/CurrencyLogo'
import ClaimRewardModal from '../../components/pools/ClaimRewardModal'
import { useStakingInfoTop } from 'state/pools/hooks'
import { currencyId } from 'utils/currencyId'
import { Link } from 'react-router-dom'
import SettingIcon from '../Settings/SettingIcon'
import { ReactComponent as SkyFiSvg } from './../../assets/svg/SkyFi.svg'

const moment = require('moment')

const StakingCardStyled = styled.div`
  width: 450px;
  position: relative;
  height: fit-content;
  margin-bottom: 20px;  
`
const CardContainer = styled.div`
  // box-shadow: inset 2px 2px 2px 4px rgb(255 255 255 / 10%);
  // backdrop-filter: blur(28px);
  border-radius: 20px;
  background: linear-gradient(#101010, #101010) padding-box, 
  linear-gradient(to right, #329D9C, #7BE495);
  background-origin: padding-box, border-box;
  background-repeat: no-repeat;
  border: 3px solid transparent;
  padding: 2rem;
`

const HarvestContent = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 30px;
  justify-content: space-between;
`

const HarvestColumn = styled.div`
  min-width: 100px;
  display: flex;
  flex-direction: column;  
`

const AprColumn = styled(HarvestColumn)`
  align-items: start;
`

const EarnedColumn = styled(HarvestColumn)`
  align-items: center;
`

const ScoreColumn = styled(HarvestColumn)`
  align-items: end;
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 12px;
`

const Header = styled.h2`
  font-weight: 500;
  font-size: 35px;
  color: #fff;
  text-transform: uppercase;
`

const LogoWrapper = styled.div`
  width: 60px;
  height: 60px;  
`

const Title = styled.h3`
  font-weight: 500;
  font-size: 15px;
  color: #919191;
  margin: 0px;
  text-transform: uppercase;
`
const Apr = styled.p`
  font-size: 25px;
  font-weight: 500;
  color: #fff;
  margin-top: 12px;
`

const Earned = styled.p`
  font-size: 25px;
  font-weight: 500;
  color: #fff;
  margin-top: 12px;
  margin-bottom: 0px;
`

const Score = styled.p`
  font-size: 25px;
  font-weight: 500;
  color: #fff;
  margin-top: 12px;
`

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 3rem;
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
`

const DetailsContent = styled.div`  
  background-color: #79E295;
  background-image: linear-gradient(45deg, #79E295, #349F9C);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;

  font-size: 18px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  text-transform: uppercase;
`

const DetailsIcon = styled.div`  
  border-radius: 50%;
  background: linear-gradient(#101010, #101010) padding-box, 
  linear-gradient(45deg, #79E295, #349F9C);
  background-origin: padding-box, border-box;
  background-repeat: no-repeat;
  border: 1px solid transparent;
  width: 20px;
  height: 20px;
`

const ManageContent = styled.div`    
  background-color: #9384DB;
  background-image: linear-gradient(45deg, #9384DB, #D49584);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 18px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-transform: uppercase;
`

export const StyledManageLink = styled(Link)`
  text-decoration: none;
  cursor: pointer; 
`

const IconWrapper = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  img {
    max-width: 100%;
  }
`

const Flex = styled(Row)`
  align-items: center;
  justify-content: space-between;
`

const CenterWrap = styled.div`
  padding: 24px;
  border-bottom: 1px solid #FF9F81;
`

const SmallNumberEarn = styled.p`
  font-size: 15px;
  font-weight: 300;
  color: #fff;
  margin-top: 12px;
`

const BottomWrap = styled(CenterWrap)`
  border-bottom: none;
`

const ArrayWrap = styled.div<{ showDetails: boolean }>`
  transform: ${({ showDetails }) => (showDetails ? 'rotate(180deg)' : 'none')};
  display: flex;
`

const DetailsWrap = styled(BottomWrap)`
  padding: 20px 24px 0px 24px;
`

const FlexEnd = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
  align-items: center;
  gap: 5px;

  a {
    text-decoration: none;
    font-size: 13px;
    transition: color ease 0.3s;

    :hover {
      color: white;
    }
  }
`

const SkySlider = withStyles({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
})(Slider);

const StakingCard = ({ stakingInfoTop, account, chainId }: { stakingInfoTop: StakingInfo, account: string | null | undefined, chainId: number | undefined }) => {
  const { library } = useActiveWeb3React()
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [showDetails, setShowDetails] = useState<boolean>(false)
  const [tooltipShow, setTooltipShow] = useState<boolean>(false)
  const [openRoiModal, setOpenRoiModal] = useState<boolean>(false)
  const [claimRewardStaking, setClaimRewardStaking] = useState<any>(null)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState<boolean>(false)

  const {
    countUpAmount,
    isStaking,
    backgroundColor,
    currency0,
    currency1,
    stakingInfo,
    valueOfTotalStakedAmountInUSDC,
    stakingRewardAddress,
    valueOfTotalStakedAmountInWETH,
    countUpAmountPrevious,
    symbol,
    apr
  } = useStakingInfoTop(stakingInfoTop);

  const tokenName = stakingInfo.tokens[0] == stakingInfo.tokens[1] ? stakingInfo.tokens[0].symbol : stakingInfo.tokens[1].symbol + '/' + stakingInfo.tokens[0].symbol + ' LP';
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)

  const toggleWalletModal = useWalletModalToggle()

  const handleEnableClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  const handleHarvest = (stakingInfo: any) => {
    setClaimRewardStaking(stakingInfo)
    setShowClaimRewardModal(true)
  }

  const url = process.env.REACT_APP_URL
  const { ethereum } = window
  const isMetaMask = !!(ethereum && ethereum.isMetaMask)

  const onClickAddToken = async (outputToken: Token) => {
    let { ethereum } = window

    if (ethereum) {
      const data = {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: outputToken?.address, // The address that the token is at.
          symbol: outputToken?.symbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: outputToken?.decimals, // The number of decimals in the token
          image: `${url}${getCurrencyLogoImage(outputToken?.symbol)}` // '' A string url of the token logo
        }
      }
      /* eslint-disable */
      const request =
        ethereum && ethereum.request ? ethereum['request']({ method: 'wallet_watchAsset', params: data }).catch() : ''

      if (request !== '') {
        request.then(t => {
          console.log(t)
        })
      } else {
        //setMetamaskError(true)
      }
    }
  }

  return (
    <StakingCardStyled>
      {claimRewardStaking && (
        <>
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => {
              setShowClaimRewardModal(false)
              setClaimRewardStaking(null)
            }}
            stakingInfo={claimRewardStaking}
          />
        </>
      )}
      {stakingInfo && (<StakingModal
        stakingInfo={stakingInfo}
        isOpen={showStakingModal}
        onDismiss={() => setShowStakingModal(false)}
        userLiquidityUnstaked={userLiquidityUnstaked} />)}
      <StakingRoiModal open={openRoiModal} setOpen={setOpenRoiModal} />
      <BubbleBase />
      <CardContainer>
        <HeaderContent>
          {/* <LogoWrapper src="./images/" />    */}
          <LogoWrapper>
            <SkyFiSvg />
          </LogoWrapper>
          <Header>
            {tokenName}
          </Header>
        </HeaderContent>
        <HarvestContent>
          <AprColumn>
            <div onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>
              <Tooltip text="This pool’s rewards aren’t compounded automatically, so we show APR" show={tooltipShow}>
                <Title>Apr</Title>
              </Tooltip>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Apr>{apr.toNumber()}%</Apr>
              {/* <div style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => setOpenRoiModal(true)}>
                <Icon icon="alien" color="#a7b1f4" />
              </div> */}
            </div>
          </AprColumn>
          <EarnedColumn>
            <Title>Earned</Title>
            <Earned>{stakingInfo?.earnedAmount.toFixed(2)}</Earned>
            <SmallNumberEarn>~0 USD</SmallNumberEarn>
          </EarnedColumn>
          <ScoreColumn>
            <Title>Your Score</Title>
            <Score>{stakingInfo.userScore?.toNumber()}</Score>
          </ScoreColumn>
        </HarvestContent>
        <ButtonContent>
          <ButtonWrapper>
            <ButtonPrimary width="200px" onClick={handleEnableClick}>STAKE</ButtonPrimary>
            <DetailsContent onClick={() => setShowDetails(!showDetails)}>
              {/* <DetailsIcon><span style={{color: "#fff"}}>...</span></DetailsIcon> */}
              <ArrayWrap showDetails={showDetails}>
                <ChevronDown size="20" color="#79E295" />
              </ArrayWrap>
              <div>{showDetails ? 'Hide' : 'Details'}</div>
            </DetailsContent>
          </ButtonWrapper>
          <ButtonWrapper>
            <ButtonSecondary width="150px" onClick={() => handleHarvest(stakingInfo)}>HARVEST</ButtonSecondary>
            <StyledManageLink
              to={{
                pathname: `/manage/${currencyId(currency0)}/${currencyId(currency1)}`,
                state: { stakingRewardAddress }
              }}>
              <ManageContent>
                <div style={{ width: "20px", height: "20px" }}><SettingIcon stroke="#9384DB" /></div>
                <div>Manage</div>
              </ManageContent>
            </StyledManageLink>
          </ButtonWrapper>
        </ButtonContent>
        {showDetails && (
          <DetailsWrap>
            <Flex>
              <h5>Total staked:</h5>
              <h5>{stakingInfo?.totalStakedAmount.toFixed(2)} {tokenName}</h5>
            </Flex>
            <Flex>
              <h5>End:</h5>
              <h5>{moment(stakingInfo?.periodFinish).fromNow()}</h5>
            </Flex>
            {chainId && (
              <FlexEnd>
                <a href={getEtherscanLink(chainId, stakingInfo.stakingRewardAddress, 'address')} target="_blank">View Contract</a>
                <IconWrapper>
                  <img src={OutsideLink} alt="MetaMask icon" />
                </IconWrapper>
              </FlexEnd>
            )}
            {stakingInfo?.stakedAmount?.token && isMetaMask && (
              <>

              </>
            )}
            <FlexEnd>
              <a onClick={() => { onClickAddToken(stakingInfo?.stakedAmount?.token) }}>
                Add to Metamask
              </a>
              <IconWrapper>
                <img src={MetaMaskIcon} alt="MetaMask icon" />
              </IconWrapper>
            </FlexEnd>
          </DetailsWrap>
        )}
      </CardContainer>
    </StakingCardStyled>
  )
}

export default StakingCard
