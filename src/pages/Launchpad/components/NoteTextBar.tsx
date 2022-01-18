import React, { useEffect, useMemo, useState, memo } from 'react'
import moment from 'moment'
import styled from 'styled-components'

const Container = styled.div`    
    padding: 10px;
    `
const TextBox = styled.div<{width:number | undefined; type:string | undefined; fontsize:number | undefined}>`
    span {
        font-size: ${({ fontsize }) => (fontsize ? fontsize + 'px' : '14px')};
        color: ${({ type }) => (type?type==="success" ? 'green' : type==="warning"?"yellow":type==="error"?"red":"white":"white")};        
    }
    text-align: center;        
    width: ${({width}) => (width ? width + 'px' : "100%")}
    `

const NoteTextBar = ({ notetext, type, width, fontsize }: { notetext?: string, type?: string, width?:number, fontsize?:number }) => {
    
    return (
        <>
            <Container>
                <TextBox width={width} type={type} fontsize={fontsize}><span>{notetext}</span></TextBox>
            </Container>
        </>
    )
}

export default memo(NoteTextBar)