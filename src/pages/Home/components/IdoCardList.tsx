import React, { useMemo, useState, useEffect, useRef } from 'react'
import IdoCard from "./IdoCard"
import styled from 'styled-components'
import LeftArrow from './LeftArrow'
import RightArrow from './RightArrow'

const CardListContainer = styled.div`
  overflow: hidden;  
  width: 100%;
`
const CardListContent = styled.div`
    margin: 16px 8px;
    display: block;
    position: relative;
    overflow: visible;
    white-space: nowrap;
    width: 1px;
`
const ArrowButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  gap: 24px;
`
export default function IdoCardList({ IdoFiltered, options, idoType }:
    { IdoFiltered: any, options: any, idoType: number }) {
    const [cardIndex, setCardIndex] = useState(0)

    const handleLeftClick = () => {
        if (cardIndex > 0) setCardIndex(cardIndex - 1)
        else setCardIndex(IdoFiltered.length - 1)
    }

    const handleRightClick = () => {
        if (cardIndex < IdoFiltered.length - 1) setCardIndex(cardIndex + 1)
        else setCardIndex(0)
    }

    return (
        <div style={{ width: '100%' }}>
            <CardListContainer>
                <CardListContent>
                    {IdoFiltered && IdoFiltered.map((item: any, index: number) => {
                        return (
                            <div key={index} style={{ display: 'inline-block' }}>
                                <IdoCard ido={item} firstCardIndex={cardIndex} options={options} idoType={idoType} />
                            </div>
                        )
                    })}
                </CardListContent>
            </CardListContainer>
            {IdoFiltered.length>0 && <ArrowButtonContainer>
                <LeftArrow handleLeftClick={handleLeftClick} />
                <RightArrow handleRightClick={handleRightClick} />
            </ArrowButtonContainer>}
        </div>
    )
}