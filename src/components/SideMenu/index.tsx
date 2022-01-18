import React, { useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { ExternalLink } from '../../theme'
import Icon from '../Icon'
import Logo from './../../assets/images/skylaunch_logo_white_01.png'
import NonceBloxLogo from './../../assets/images/nonceblox-logo.png'

import Annoucements from './../../assets/social_icons/annoucements.png'
import Linktree from './../../assets/social_icons/linktree.png'
import Medium from './../../assets/social_icons/medium.png'
import Reddit from './../../assets/social_icons/reddit.png'
import Telegram from './../../assets/social_icons/telegram.png'
import Twitter from './../../assets/social_icons/twitter.png'
import Website from './../../assets/social_icons/website.png'

import { ReactComponent as BuySkyFiSvg } from './../../assets/svg/buyskyfi.svg'
import { ReactComponent as FacebookSvg } from './../../assets/svg/facebook.svg'
import { ReactComponent as InstagramSvg } from './../../assets/svg/instagram.svg'
import { ReactComponent as TwitterSvg } from './../../assets/svg/twitter.svg'
import { ReactComponent as YoutubeSvg } from './../../assets/svg/youtube.svg'
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
  font-family: 'Poppins', sans-serif;
  margin-bottom: 1.5rem;
  span {
    &.active {
      color: ${({ theme }) => theme.skyGreenLight};
    }
  }
`
const HeaderExternalLink = styled(ExternalLink)`
  color: ${({ theme }) => theme.white};
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
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
  font-family: 'Poppins', sans-serif;
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
  justify-content: space-between;
  margin-bottom: 30px;
  margin-top: 3rem;
`

const FooterLogo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-transform: uppercase;
  font-size: 16px;

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
  font-family: 'Poppins', sans-serif;
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
          <StyledNavLink id={`swap-nav-link`} to={'/home'} onClick={handleSideMenuOpen}>
            <IconLink>
              <Icon icon="home" active={pathname === '/home'} />
            </IconLink>
            <span className={pathname === '/home' ? 'active' : ''}>{t('Home')}</span>
          </StyledNavLink>
          <StyledNavLink id={`staking-nav-link`} to={'/stake'} onClick={handleSideMenuOpen}>
            <IconLink>
              <Icon icon="market" active={pathname === '/stake'} />
            </IconLink>
            <span className={pathname === '/stake' ? 'active' : ''}>{t('Stake')}</span>
          </StyledNavLink>
          {/* <StyledNavLink id={`swap-nav-link`} to={'/swap'} onClick={handleSideMenuOpen}>
            <IconLink>
              <Icon icon="swap" active={pathname === '/swap'} />
            </IconLink>
            <span className={pathname === '/swap' ? 'active' : ''}>{t('Swap')}</span>
          </StyledNavLink>
          <StyledNavLink id={`transfer-nav-link`} to={'/transfer'} onClick={handleSideMenuOpen}>
            <IconLink>
              <Icon icon="bridges" active={pathname === '/transfer'} />
            </IconLink>
            <span className={pathname === '/transfer' ? 'active' : ''}>{t('Transfer')}</span>
          </StyledNavLink>
          <StyledNavLink id={`pools-nav-link`} to={'/pools'} onClick={handleSideMenuOpen}>
            <IconLink>
              <Icon icon="earn" active={pathname === '/pools'} />
            </IconLink>
            <span className={pathname === '/pools' ? 'active' : ''}>{t('Pools')}</span>
          </StyledNavLink>
          <HeaderExternalLink href={`https://charts.0.exchange`}>
            <IconLink>
              <Icon icon="charts" />
            </IconLink>
            {t('Charts')}
          </HeaderExternalLink> */}
          <StyledNavLink id={`pools-nav-link`} to={'/launchpad'} onClick={handleSideMenuOpen}>
            <IconLink>
              <Icon icon="planet" active={pathname.includes('launchpad')} />
            </IconLink>
            <span className={pathname.includes('launchpad') ? 'active' : ''}>{t('Launchpad')}</span>
          </StyledNavLink>
          { chainId && (
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
            {t('More ...')}
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
            {/* <FooterExternalLink href={'https://facebook.com/SkyLaunchDefi'} style={{ marginTop: '3rem' }}>
              <FooterIconLink>
                <FacebookSvg />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://instagram.com/SkyLaunchDefi'} style={{ marginTop: '3rem' }}>
              <FooterIconLink>
                <InstagramSvg />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://twitter.com/skylaunchdefi'} style={{ marginTop: '3rem' }}>
              <FooterIconLink>
                <TwitterSvg />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://youtube.com/SkyLaunchDefi'} style={{ marginTop: '3rem' }}>
              <FooterIconLink>
                <YoutubeSvg />
              </FooterIconLink>
            </FooterExternalLink> */}            
            <FooterExternalLink href={'https://linktr.ee/Skylaunch'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Linktree} alt="" width="22px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://skylaunch.finance'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Website} alt="" width="22px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://medium.com/skylaunch'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Medium} alt="" width="22px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://t.me/SkylaunchNews'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Annoucements} alt="" width="22px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://twitter.com/skylaunchdefi'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Twitter} alt="" width="22px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://www.reddit.com/r/SkyLaunch/'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Reddit} alt="" width="22px" />
              </FooterIconLink>
            </FooterExternalLink>
            <FooterExternalLink href={'https://t.me/skylaunchchat'} style={{ margin: '1px' }}>
              <FooterIconLink>
              <img src={Telegram} alt="" width="22px" />
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
