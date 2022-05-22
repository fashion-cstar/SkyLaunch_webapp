import React from 'react'
import styled from 'styled-components'

const HeaderTabContainer = styled.div<{ separated?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ separated }) => (separated ? '0px' : '24px')};  
  ${({ theme }) => theme.mediaWidth.upToSmall`    
    justify-content: center;
    width: 100%;
    margin: 0px 12px;
    gap: 24px;
  `};
`
const HeaderTabBox = styled.div`
  display: flex;
  align-items: center;
`
const HeaderTabItemWrapper = styled.div<{ isActive?: boolean }>`
  background: ${({ isActive }) => (isActive ? 'linear-gradient(to right, #79E295, #349F9C);' : 'transparent')};
  :hover {
    background: linear-gradient(to right, #79E295, #349F9C);
  }
`
const TabSeparator = styled.div`
  border-right: 1px solid #707070;
  height: calc(100% - 6px);
  margin: 0px 24px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0px;   
    border-right: none;
  `};
`
const HeaderTabItem = styled.div`
  cursor: pointer;
  // min-width: 100px;  
  background: #1c1c1c;
  margin-bottom: 2px; 
  padding: 0px 16px; 
  :hover,
  .selected {
    font-weight: 400
  }
`

const ActiveText = styled.div`  
  background-color: #79E295;
  background-image: linear-gradient(45deg, #79E295, #349F9C);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent; 
  -moz-text-fill-color: transparent;

  text-align: center;
  font-size: 18px;
  font-weight: 700; 
  text-transform: uppercase;
`

const InActiveText = styled.div`  
  text-align: center;
  font-size: 17px;
  font-weight: 200; 
  text-transform: uppercase;
`

export interface TabProps {
  name: string
  value: string
}

const MenuTabs = ({
  tabs,
  active,
  separated,
  onChange
}: {
  tabs: TabProps[],
  active: string,
  separated: boolean,
  onChange: (tab: string) => void
}) => {
  return (
    <HeaderTabContainer separated={separated}>
      {tabs.map((t, index) => (
        <HeaderTabBox>
          <HeaderTabItemWrapper key={index} isActive={active === t.value ? true : false}>
            <HeaderTabItem onClick={() => onChange(t.value)}>
              {active === t.value ?
                <ActiveText>{t.name}</ActiveText> :
                <InActiveText>{t.name}</InActiveText>}
            </HeaderTabItem>
          </HeaderTabItemWrapper>
          {separated && index < tabs.length - 1 ? <TabSeparator /> :
            <div />}
        </HeaderTabBox>
      ))
      }
    </HeaderTabContainer>
  )
}

export default MenuTabs
