import React, { useMemo, useState, useEffect, useRef } from 'react'
import RightArrowIcon from "./RightArrowIcon"

export default function RightArrow({ handleRightClick }: { handleRightClick: () => void }) {
    return (
        <div style={{width: '24px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center'}} onClick={handleRightClick}>
            <RightArrowIcon />
        </div>
    )
}