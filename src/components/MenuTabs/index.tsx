import React from 'react'
import styled from 'styled-components'

export const HeaderTabContainer = styled.div`
  display: flex;
`

const HeaderTabItemWrapper = styled.div<{isActive?: boolean}>`
  margin-right: 10px;
  background: ${({ isActive }) => (isActive ? 'linear-gradient(to right, #79E295, #349F9C);' : 'transparent')};
  :hover {
    background: linear-gradient(to right, #79E295, #349F9C);
  }
`

const HeaderTabItem = styled.div`
  cursor: pointer;
  min-width: 100px;
  text-align: center;
  background: #1c1c1c;
  padding-bottom: 10px;
  margin-bottom: 4px;
  :hover,
  .selected {
    font-weight: 600
  }
`

export interface TabProps {
  name: string
  value: string
}

const MenuTabs = ({ 
  tabs,
  active,
  onChange
} : { 
  tabs: TabProps[],
  active: string,
  onChange: (tab: string) => void
}) => {
  return (
    <HeaderTabContainer>
      {tabs.map((t, index) => (
          <HeaderTabItemWrapper key={index} isActive={active === t.value ? true : false}>
            <HeaderTabItem onClick={() => onChange(t.value)}>
              {t.name}
            </HeaderTabItem>
          </HeaderTabItemWrapper>
        ))
      }
    </HeaderTabContainer>
  )
}

export default MenuTabs
