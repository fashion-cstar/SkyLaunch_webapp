import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { ExternalLink } from '../../theme'
import Icon from '../Icon'
import Logo from './../../assets/images/skylaunch_logo_white_01.png'
import NonceBloxLogo from './../../assets/images/nonceblox-logo.png'

import Annoucements from './../../assets/social_icons/annoucements.png'
import Medium from './../../assets/social_icons/medium.png'
import Reddit from './../../assets/social_icons/reddit.png'
import Telegram from './../../assets/social_icons/telegram.png'
import Twitter from './../../assets/social_icons/twitter.png'
import Website from './../../assets/social_icons/website.png'

import { ReactComponent as HomeSvg } from './../../assets/svg/sidebar/home.svg'
import { ReactComponent as HomeFillSvg } from './../../assets/svg/sidebar/home_fill.svg'
import { ReactComponent as StakeSvg } from './../../assets/svg/sidebar/stake.svg'
import { ReactComponent as StakeFillSvg } from './../../assets/svg/sidebar/stake_fill.svg'
import { ReactComponent as LaunchPadSvg } from './../../assets/svg/sidebar/launchpad.svg'
import { ReactComponent as LaunchPadFillSvg } from './../../assets/svg/sidebar/launchpad_fill.svg'
import { ReactComponent as IdoSvg } from './../../assets/svg/sidebar/ido.svg'
import { ReactComponent as IdoFillSvg } from './../../assets/svg/sidebar/ido_fill.svg'

import { ReactComponent as BuySkyFiSvg } from './../../assets/svg/buyskyfi.svg'
import MenuBurger from './../MenuBurger'
import ModalMore from './../ModalMore'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import { SKYFI } from '../../constants'
import { useActiveWeb3React } from 'hooks'

const SideMenuWrapper = styled.div<{ open?: boolean }>`
  height: 100%;  
  width: 260px;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 1);
  justify-content: center;
  z-index: 1000;

  ${({ theme }) => theme.mediaWidth.upToMedium<{ open?: boolean }>`
    display: ${({ open }) => {
      return open ? 'flex' : 'none'
    }};
    position: fixed;
    background: rgba(0,0,0,.95);
    left: 0;
    top: 0;
    width: 100%;
    z-index: 1000000;
    border-right: 0;
    align-items: center;
    z-index: 2
  `};
`
const HeaderLinks = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 45px;
  margin-bottom: 10px;
  font-weight: 600;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  padding-left: 0px;
`};
`
const activeClassName = 'ACTIVE'
const StyledNavLink = styled(NavLink).attrs({
  activeClassName
})`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  outline: none;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.white};
  width: fit-content;
  font-weight: 600;
  transition: all 0.2s ease-in-out;  
  margin-bottom: 1.5rem;
  span {
    &.active {
      color: ${({ theme }) => theme.skyGreenLight};
    }
  }
`

const StyledNavSvgLink = styled(NavLink)`  
  align-items: center;
  outline: none;  
  cursor: pointer;
  text-transform: uppercase;
  font-size: 16px;
  text-decoration: none;
  color: ${({ theme }) => theme.white};  
  font-weight: 600;  
  transition: all 0.2s ease-in-out;    
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: row;  
  span {    
    &.active {
      color: ${({ theme }) => theme.skyGreenLight};
    }
  }
  svg {
    width: 20px;
  }
`

const HeaderExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.white};
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  font-size: 16px;  
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  :hover,
  :focus {
    text-decoration: none;
  }

  svg {
    width: 20px;
  }
`

const SubExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.white};
  text-transform: uppercase;
  font-size: 14px;  
  font-weight: 500;
  opacity: 0.6;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  :hover,
  :focus {
    text-decoration: none;
  }
`

const SubLinks = styled.div`
  margin: 2rem 0 7rem;
`

const IconLink = styled.span`
  display: flex;
  margin-right: 20px;
  align-items: center;
`
const MoreLink = styled.span`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.white};
`
const Title = styled.a`
  position: absolute;
  top: 46px;
  left: 29px;
  width: 200px;
  cursor: pointer;
  ${({ theme }) => theme.mediaWidth.upToMedium`
  display: none;
  `};
`

const FooterContainer = styled.div`
  width: inherit;
  position: absolute;
  bottom: 40px;
  padding: 0 40px;
`

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 10px;
  margin-bottom: 15px;
`

const FooterLogo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-transform: uppercase;
  font-size: 16px;
  margin-top: 30px;
  span {
    opacity: 0.6;
  }

  img {
    height: 30px;
    width: 105px;
  }
`

const FooterExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.white};
  text-transform: uppercase;
  font-size: 16px;  
  font-weight: 600;
  display: flex;
  flex-direction: row;
  align-items: center;
  :hover,
  :focus {
    text-decoration: none;
  }

  svg {
    width: 30px;
  }
`

const FooterIconLink = styled.span`
  display: flex;
  align-items: center;
`

export default function SideMenu() {
  const { chainId } = useActiveWeb3React();
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const history = useHistory()
  const location = useLocation()
  const [pathname, setPathname] = useState(location.pathname)
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [open, setOpen] = useState<boolean>(false)

  history.listen((location) => { setPathname(location.pathname) })

  const toggleOpen = () => {
    setOpen(!open)
  }
  const handleSideMenuOpen = () => width < 961 && setOpen(!open)

  return (
    <>
      <MenuBurger open={open} setOpen={toggleOpen} />

      <ModalMore isOpen={isOpenModal} onDismiss={() => setIsOpenModal(false)} />
      <SideMenuWrapper open={open}>
        <Title href="/">
          <img width={'100%'} src={Logo} alt="logo" />
        </Title>
        <HeaderLinks>
          <StyledNavSvgLink id={`swap-nav-link`} to={'/home'} onClick={handleSideMenuOpen}>
            <IconLink>
              {pathname.includes('home') ? <HomeFillSvg /> : <HomeSvg />}
              {/* <Icon icon="home" active={pathname === '/home'} /> */}
            </IconLink>
            <span className={pathname === '/home' ? 'active' : ''}>{t('Home')}</span>
          </StyledNavSvgLink>
          <StyledNavSvgLink id={`staking-nav-link`} to={'/stake'} onClick={handleSideMenuOpen}>
            <IconLink>
              {pathname.includes('stake') ? <StakeFillSvg /> : <StakeSvg />}
            </IconLink>
            <span className={pathname === '/stake' ? 'active' : ''}>{t('Stake')}</span>
          </StyledNavSvgLink>
          <StyledNavSvgLink id={`pools-nav-link`} to={'/launchpad'} onClick={handleSideMenuOpen}>
            <IconLink>
              {pathname.includes('launchpad') ? <LaunchPadFillSvg /> : <LaunchPadSvg />}
            </IconLink>
            <span className={pathname.includes('launchpad') ? 'active' : ''}>{t('Launchpad')}</span>
          </StyledNavSvgLink>
          <StyledNavSvgLink id={`pools-nav-link`} to={'/ido'} onClick={handleSideMenuOpen}>
            <IconLink>
              {pathname.includes('ido') ? <IdoFillSvg /> : <IdoSvg />}
            </IconLink>
            <span className={pathname.includes('ido') ? 'active' : ''}>{t('User Ido Tokens')}</span>
          </StyledNavSvgLink>
          {chainId && (
            <HeaderExternalLink href={'https://app.uniswap.org/#/swap?use=V2&inputCurrency=ETH&outputCurrency=' + SKYFI[chainId].address}>
              <IconLink>
                <BuySkyFiSvg />
              </IconLink>
              Buy SKYFI
            </HeaderExternalLink>
          )}
          <MoreLink onClick={() => setIsOpenModal(true)}>
            <IconLink style={{ paddingTop: '4px' }}>
              <Icon icon="more" />
            </IconLink>
            {t('MORE ...')}
          </MoreLink>
          <SubLinks>
            <SubExternalLink href={'https://skylaunch.finance/'}>
              Main Site
            </SubExternalLink>
            <SubExternalLink href={'https://t.me/SkylaunchNews'}>
              Announcements
            </SubExternalLink>
          </SubLinks>
        </HeaderLinks>
        <FooterContainer>
          <FooterLinks>
            {/* <FooterExternalLink href={'https://linktr.ee/Skylaunch'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Linktree} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink> */}
            <FooterExternalLink href={'https://skylaunch.finance'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Website} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://medium.com/skylaunch'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Medium} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://t.me/SkylaunchNews'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Annoucements} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink>
          </FooterLinks>
          <FooterLinks>
            <FooterExternalLink href={'https://twitter.com/skylaunchdefi'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Twitter} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://www.reddit.com/r/SkyLaunch/'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Reddit} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://t.me/skylaunchchat'} style={{ margin: '1px' }}>
              <FooterIconLink>
                <img src={Telegram} alt="" width="33px" />
              </FooterIconLink>
            </FooterExternalLink>
          </FooterLinks>
          <FooterLogo>
            <span>Audited By</span>
            <img width={'100%'} src={NonceBloxLogo} alt="logo" />
          </FooterLogo>
        </FooterContainer>
      </SideMenuWrapper>
    </>
  )
}
