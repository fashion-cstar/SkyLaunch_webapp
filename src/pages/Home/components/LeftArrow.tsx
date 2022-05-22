import React, { useMemo, useState, useEffect, useRef } from 'react'
import RightArrowIcon from "./RightArrowIcon"

export default function LeftArrow({ handleLeftClick }: { handleLeftClick: () => void }) {
    return (
        <div style={{width: '24px', cursor: 'pointer'}} onClick={handleLeftClick}>
            <div style={{transform: 'rotate(180deg)', display:'flex', alignItems:'center', justifyContent:'center'}}><RightArrowIcon /></div>
        </div>
    )
}