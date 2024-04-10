import { useState, useEffect } from 'react'

export const PLATFORM = {
    MOBILE: "MOBILE",
    DESKTOP: "DESKTOP"
}

export function useEffectResize(callback, dependencies) {
  const [platform, setPlatform] = useState("desktop")

  const updatePlatform = () => {
    const isMobile = window?.getComputedStyle(document.getElementsByTagName("header")[0]).display !== "none"
    const newPlatform = isMobile ? PLATFORM.MOBILE : PLATFORM.DESKTOP
    setPlatform(newPlatform)
    callback(newPlatform)
  }

  useEffect(() => {
    updatePlatform()

    const resizeHandler = () => {
      updatePlatform()
    }

    window.addEventListener("resize", resizeHandler)
    return () => window.removeEventListener("resize", resizeHandler)

  }, [...dependencies])

  return platform
}
