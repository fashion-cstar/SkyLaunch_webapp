import { AlertCircle, CheckCircle } from 'react-feather'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'

import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import { ExternalLink } from '../../theme/components'
import { TYPE } from '../../theme'
import { getEtherscanLink } from '../../utils'
import { useActiveWeb3React } from '../../hooks'
const RowNoFlex = styled(AutoRow)`
  flex-wrap: nowrap;
`

export default function TxRevertedPopup({
    message
}: {
    message: string
}) {
    const theme = useContext(ThemeContext)

    return (
        <RowNoFlex>
            <div style={{ paddingRight: 16 }}>
                <AlertCircle color={theme.red1} size={24} />
            </div>
            <strong>{message}</strong>
        </RowNoFlex>
    )
}
