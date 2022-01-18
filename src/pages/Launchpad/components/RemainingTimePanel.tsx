import React, { useEffect, useMemo, useState, memo } from 'react'
import moment from 'moment'
import styled from 'styled-components'

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    `

const TContainer = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;    
    padding: 0 40px;
    width: 50px;
    border: 1px solid #222222;
    `
const NumBox = styled.div`
    textAlign: center;
    font-size: 20px;
    padding: 0px;
    color: #bbbbbb;
    `

const SynBox = styled.div`
    textAlign: center;
    color: #a0a0a0;
    font-size: 13px
    `

const RemainingTimePanel = ({ secs }: { secs?: number }) => {
    const [days, setDays]=useState("00")
    const [hours, setHours]=useState("00")
    const [minutes, setMinutes]=useState("00")
    const [seconds, setSeconds]=useState("00")    
    useEffect(() => {
        if (secs){                  
            let dd=Math.floor((secs/86400))            
            let hh=Math.floor((secs%86400)/3600)
            let mm=Math.floor(((secs%3600)/60))
            let ss=secs%60            
            setDays(dd.toString())
            if (dd<100) setDays(dd.toString().padStart(2,'0'))
            setHours(hh.toString().padStart(2, '0'))
            setMinutes(mm.toString().padStart(2, '0'))
            setSeconds(ss.toString().padStart(2, '0'))
        }
    }, [secs])
    return (
        <>
            <Container>
                <TContainer>
                    <NumBox>{days}</NumBox>
                    <SynBox>DD</SynBox>
                </TContainer>
                <TContainer>
                    <NumBox>{hours}</NumBox>
                    <SynBox>HH</SynBox>
                </TContainer>
                <TContainer>
                    <NumBox>{minutes}</NumBox>
                    <SynBox>MM</SynBox>
                </TContainer>
                <TContainer>
                    <NumBox>{seconds}</NumBox>
                    <SynBox>SS</SynBox>
                </TContainer>
            </Container>
        </>
    )
}

export default memo(RemainingTimePanel)