import React, { useCallback, useContext, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Input as NumericalInput } from 'components/NumericalInput'
import { useTranslation } from 'react-i18next'

const InputRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: center;
  padding: '0.75rem 0.75rem 0.75rem 1rem';
  ${({ theme }) => theme.mediaWidth.upToSmall`
  flex-direction: column;
`};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
  padding: 0;
  margin-top: 25px;
`};
`
const InputPanel = styled.div<{ transferPage?: boolean }>`
  ${({ theme }) => theme.flexColumnNoWrap}
  position: relative;
  background: rgba(28, 28, 28, 0.54);
  box-shadow: inset 2px 2px 5px rgba(255, 255, 255, 0.095);
  backdrop-filter: blur(28px);
  border-radius: 44px;
  z-index: 1;
`

const Container = styled.div`
  padding: 1rem 1.5rem;
  &.grayed-out {
    opacity: .2;
    pointer-events: none;
  }
`

const StyledBalanceMax = styled.button`
  height: 35px;
  border: 2px solid #1ef7e7;
  background: transparent;
  border-radius: 100px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-right: 0.5rem;
  color: #1ef7e7;
  transition: all 0.2s ease-in-out;
  padding-left: 10px;
  padding-right: 10px;
  :hover {
    opacity: 0.9;
  }
  :focus {
    outline: none;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 15px auto 0;
  `};
`

interface FundingInputPanelProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
}

export default function FundingInputPanel({
  value,
  onUserInput,
  onMax,
}: FundingInputPanelProps) {
  const { t } = useTranslation()

  const [modalOpen, setModalOpen] = useState(false)
  const [modal2Open, setModal2Open] = useState(false)  
  const theme = useContext(ThemeContext)

  const handleDismissSearch = useCallback(() => {
    setModalOpen(false)
  }, [setModalOpen])

  return (
    <>
      <InputPanel id="stake-liquidity-token" transferPage={false}>
        <Container>
    
          <InputRow>
        
              <>
                <NumericalInput
                  className="token-amount-input"
                  value={value}
                  fontSize="32px"                  
                  onUserInput={val => {
                    onUserInput(val)
                  }}
                />
                  <StyledBalanceMax onClick={onMax}>MAX</StyledBalanceMax>

              </>
            
          </InputRow>
        </Container>
  
      </InputPanel>
    </>
  )
}
