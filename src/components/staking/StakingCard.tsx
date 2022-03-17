import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { ChevronDown } from 'react-feather'
import Row from 'components/Row'
import BubbleBase from './../BubbleBase'
import ZeroLogo from '../../assets/images/0-icon.png'
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
import { useRewardsContractInfo } from 'stats/queries/useRewardsContractInfoQuery'
import { Token, TokenAmount } from '@skylaunch/sdk'
import { useTokenBalance } from 'state/wallet/hooks'
import { getCurrencyLogoImage } from 'components/CurrencyLogo'
import ClaimRewardModal from '../../components/pools/ClaimRewardModal'
import { useStakingInfoTop } from 'state/pools/hooks'
import { currencyId } from 'utils/currencyId'
import { StyledInternalLink, TYPE } from '../../theme'
import SettingIcon from '../Settings/SettingIcon'

const moment = require('moment')

const StakingCardStyled = styled.div`
  width: 352px;
  position: relative;
  height: fit-content;
  margin-bottom: 20px;
`
const CardContainer = styled.div`
  background: rgba(28, 28, 28, 0.54);
  box-shadow: inset 2px 2px 2px 4px rgb(255 255 255 / 10%);
  backdrop-filter: blur(28px);
  border-radius: 20px;
`
const Header = styled.header`
  // background: rgba(28, 28, 28, 0.54);
  // box-shadow: inset 2px 2px 5px rgb(255 255 255 / 10%);
  // backdrop-filter: blur(28px);
  // border-top-right-radius: 20px;
  // border-top-left-radius: 20px;
  min-height: 60px;  
  padding: 24px;
`

const Title = styled.h3`
  font-weight: 600;
  line-height: 1.5;
  font-size: 20px;
`
const Description = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #a7b1f4;
  margin-bottom: 0;
`

const Score = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #a7b1f4;
  margin-bottom: 0;
  float:right;
`

const LogoWrapper = styled.div`
  width: 50px;
  height: 50px;
  img {
    max-width: 100%;
  }
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

const TextApr = styled.h3`
  color: #a7b1f4;
  font-weight: 500;
  1font-size: 14px;
`
const QuestionWrap = styled.div`
  display: flex;
`

const TextEarned = styled.h4`
  font-size: 12px;
  margin-top: 25px;
  margin-bottom: 5px;
`

const SmallNumberEarn = styled(TextApr)`
  font-size: 10px;
`

const EarnButton = styled(ButtonPrimary)`
  width: 100px;
  border-radius: 12px;
  font-size: 17px;
`

const BottomWrap = styled(CenterWrap)`
  border-bottom: none;
`

const ManualButton = styled(ButtonSecondary)`
  cursor: default;
  width: 80px;
  font-size: 10px;
  padding: 7px;
  border: 1px solid #a7b1f4;
  background: none;
  :hover {
    border-color: #a7b1f4;
  }
`

const FlexBottom = styled(Flex)`
  gap: 0.7rem;
  width: 110px;
`

const ArrayWrap = styled.div<{ showDetails: boolean }>`
  transform: ${({ showDetails }) => (showDetails ? 'rotate(180deg)' : 'none')};
  display: flex;
`

const DetailsWrap = styled(BottomWrap)`
  padding: 0 24px 24px;
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

const ManageButton = styled(StyledInternalLink)`
  postion: absolute;
  width: 140px;
  padding: 0.25rem;
  text-decoration: none !important;
  position: absolute;
  right: 0;
  top: 410px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6752f7;
  transition: all 0.2s ease-in-out;
  &:hover {
    color: #6752f7;
    filter: brightness(1.2);
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

  console.log("stakingInfo");
  console.log(stakingInfo.rewardRateWeekly.toFixed(2));

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
      <Header>
        <Flex>
          <div>
            <Title>Staking</Title>
            <Description>
              {tokenName}
            </Description>
          </div>
          <div>
            <Title>Your Score</Title>
            <Score>
              {stakingInfo.userScore?.toNumber()}
            </Score>
          </div>
        </Flex>
      </Header>
      <CenterWrap>
        <Flex>
          <div onMouseEnter={() => setTooltipShow(true)} onMouseLeave={() => setTooltipShow(false)}>
            <Tooltip text="This pool’s rewards aren’t compounded automatically, so we show APR" show={tooltipShow}>
              <TextApr>APR</TextApr>
            </Tooltip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextApr>{apr.toNumber()}%</TextApr>
            <div style={{ marginLeft: '10px', cursor: 'pointer' }} onClick={() => setOpenRoiModal(true)}>
              <Icon icon="alien" color="#a7b1f4" />
            </div>
          </div>
        </Flex>
        <TextEarned>SKYFI EARNED</TextEarned>
        <Flex>
          <div>
            <TextApr>{stakingInfo?.earnedAmount.toFixed(2)}</TextApr>
            <SmallNumberEarn>~0 USD</SmallNumberEarn>
          </div>         
          <EarnButton className="launch-button green" onClick={() => handleHarvest(stakingInfo)}>HARVEST</EarnButton>
        </Flex>
        <TextEarned>STAKE {tokenName}</TextEarned>
        <Flex>

          <ManageButton
            to={{
              pathname: `/manage/${currencyId(currency0)}/${currencyId(currency1)}`,
              state: { stakingRewardAddress }
            }}
          >
            <span style={{ marginRight: '10px', color: "#FF9F81" }}>Manage</span>
            <SettingIcon stroke="#FF9F81" />
          </ManageButton>
        </Flex>
        <ButtonSecondary
          onClick={handleEnableClick}>ENABLE</ButtonSecondary>
      </CenterWrap>
      <BottomWrap>
        <Flex>
          <Flex style={{ width: '90px', cursor: 'pointer' }} onClick={() => setShowDetails(!showDetails)}>
            <h4>{showDetails ? 'Hide' : 'Details'}</h4>
            <ArrayWrap showDetails={showDetails}>
              <ChevronDown size="24" />
            </ArrayWrap>
          </Flex>
        </Flex>
      </BottomWrap>
      </CardContainer>
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
    </StakingCardStyled>
  )
}

export default StakingCard
