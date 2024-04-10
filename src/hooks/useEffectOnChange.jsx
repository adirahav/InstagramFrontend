import { useEffect, useRef } from 'react'

export function useEffectOnChange(callback, dependencies) {

    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
      
        callback()

    }, dependencies)
}