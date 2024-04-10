import React from 'react'

export function Overlay({ onPress }) {   
    return (
        <div className="overlay mobile" onClick={onPress}></div>
    )
}
