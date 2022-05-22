import React, { useMemo, useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { ButtonPrimary, ButtonSecondary, ButtonGray, ButtonLight } from 'components/Button'
import { NavLink } from 'react-router-dom'

const StyledNavLink = styled(NavLink)`
  text-decoration: none
`
const CardOutContainer = styled.div<{ firstCardIndex?: number }>`
  padding-right: 24px;  
  transform: ${({ firstCardIndex }) => 'translateX(' + (-(firstCardIndex ?? 0) * 100) + '%)'};
  transition: transform 500ms ease 0s;
`
const CardInContainer = styled.div<{ width?: string, idoType: number }>`    
  width: ${({ width }) => (width)};
  border-radius: 24px;
  background:${({ idoType }) => ('linear-gradient(#101010, #101010) padding-box, linear-gradient(to right, ' + (idoType === 0 ? '#9384DB' : idoType === 1 ? '#329D9C' : '#B0B0B0') + ', ' + (idoType === 0 ? '#D49584' : idoType === 1 ? '#7BE495' : '#B0B0B0') + ')')} ;
  background-origin: padding-box, border-box;
  background-repeat: no-repeat;
  border: 2px solid transparent;  
  overflow: hidden;
`
const CardHeroContainer = styled.div<{ imgHeight?: string }>`
  overflow: hidden;
  position: relative;
  height: ${({ imgHeight }) => (imgHeight)};
  // border-top-left-radius: 24px;
  // border-top-right-radius: 24px;
  display: flex;
  justify-content: center;
`
const HeroImg = styled.img<{idoType?: number}>`
  width: auto;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  filter: ${({ idoType }) => (idoType===2?'grayscale(100%)':'')};
  display: block;
`
const FlexBoxIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`
const FlexBox = styled.div`  
  display: flex;
  align-items: center;
  justify-content: space-between;  
  width: 100%;
  margin-bottom: 16px;
`
const CardContent = styled.div`
  padding: 24px;
`
const ViewBtnContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
`
const ProjectTitle = styled.div`  
  font-size: 18px;  
  text-transform: uppercase;  
  color: $ffffff;
`
const StatusText = styled.div`  
  background-color: #79E295;
  background-image: linear-gradient(45deg, #79E295, #349F9C);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;

  font-size: 14px;
  font-weight: 700; 
  text-transform: uppercase;
`
interface UpcomingCardProps {
  ido: any
  firstCardIndex: number
  options: any
  idoType: number
}

export default function IdoCard({ ido, firstCardIndex, options, idoType }: UpcomingCardProps) {
  let width = (!!options && !!options.width) ? options.width : '360px'
  let imgHeight = (!!options && !!options.imgHeight) ? options.imgHeight : (!!options && !!options.width) ? `${Number(options.width.substr(0, options.width.length - 2)) * 12 / 36}px` : '120px'

  const onDetail = (ido: any) => {

  }

  return (
    <CardOutContainer firstCardIndex={firstCardIndex}>
      <CardInContainer width={width} idoType={idoType}>
        <CardHeroContainer imgHeight={imgHeight}>
          <HeroImg src={ido.hero} height={imgHeight} idoType={idoType} />
        </CardHeroContainer>
        <CardContent>
          <FlexBox>
            <FlexBoxIcon>
              <img src={ido.icon} height="32px" />
              <ProjectTitle>{ido.name}</ProjectTitle>
            </FlexBoxIcon>
            <StatusText>
              {idoType === 0 ? 'whitelist' : idoType === 1 ? 'Open Pool No.1' : 'Completed'}
            </StatusText>
          </FlexBox>
          <hr style={{ width: '100%', border: '1px solid #808080' }} />
          <ViewBtnContainer>
            <StyledNavLink id={`${ido.idoURL}-nav-link`} to={`/launchpad/${ido.idoURL}`}>
              {idoType === 0 && <ButtonSecondary style={{ width: '120px', height: '35px', textTransform: 'uppercase', color: '#111', fontStyle: 'bold' }} onClick={() => onDetail(ido)}>View</ButtonSecondary>}
              {idoType === 1 && <ButtonPrimary style={{ width: '120px', height: '35px', textTransform: 'uppercase', color: '#111', fontStyle: 'bold' }} onClick={() => onDetail(ido)}>View</ButtonPrimary>}
              {idoType === 2 && <ButtonGray style={{ width: '120px', height: '35px', textTransform: 'uppercase', color: '#111', fontStyle: 'bold' }} onClick={() => onDetail(ido)}>View</ButtonGray>}
            </StyledNavLink>
          </ViewBtnContainer>
        </CardContent>
      </CardInContainer>
    </CardOutContainer>
  )
}