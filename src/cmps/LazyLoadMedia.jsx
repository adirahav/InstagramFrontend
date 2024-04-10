import { useEffect, useState } from "react"
import pixelImage from '../assets/images/pixel.gif'

export function LazyLoadMedia({mediaUrl, mediaWidth, mediaHeight, isVideo = false, alt, aspectRatio, videoRef}) {

    const [preload, setPreLoad] = useState(true)
    const [blurMediaUrl, setBlurMediaUrl] = useState()
    const [loaded, setLoaded] = useState(false)

    const lowResolutionWidth = 100
    const lowResolutionHeight = 100

    useEffect(() => {
        if (mediaUrl) {
            if (isVideo) {
              loadLowResolutionVideo(mediaUrl)
            } else {
              loadLowResolutionImage(mediaUrl)
            }
            
        }
    }, [mediaUrl])  

    function getLowResolutionBase64Image(url) {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'Anonymous'
      
          img.onload = () => {
            const canvas = document.createElement('canvas')
            canvas.width = lowResolutionWidth
            canvas.height = lowResolutionHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, lowResolutionWidth, lowResolutionHeight)
            
            const base64Image = canvas.toDataURL('image/jpeg')
            setPreLoad(false)
            resolve(base64Image)
          }
      
          img.onerror = () => {
            setPreLoad(false)
            reject(new Error('Failed to load image'))
          }
      
          img.src = url
        })
    }

    function getLowResolutionBase64Video(url) {
        return new Promise((resolve, reject) => {
          const video = document.createElement('video')
          video.crossOrigin = 'Anonymous'
          video.preload = 'metadata'
      
          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas')
            canvas.width = lowResolutionWidth
            canvas.height = lowResolutionHeight
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, lowResolutionWidth, lowResolutionHeight)
            
            const base64Video = canvas.toDataURL('image/jpeg') 
            setPreLoad(false)
            resolve(base64Video)
          }
      
          video.onerror = () => {
            setPreLoad(false)
            reject(new Error('Failed to load video'))
          }
      
          video.src = url
          video.load()
        })
      }

      
    function loadLowResolutionImage(imageUrl) {
      getLowResolutionBase64Image(imageUrl)
        .then(base64Image => {
            setBlurMediaUrl(base64Image)
        })
        .catch(error => {
            setBlurMediaUrl(pixelImage) 
            console.error(error)
        })
    }

    function loadLowResolutionVideo(imageUrl) {
      getLowResolutionBase64Video(imageUrl)
        .then(base64Image => {
            setBlurMediaUrl(base64Image)
        })
        .catch(error => {
            setBlurMediaUrl(pixelImage) 
            console.error(error)
        })
  }
    
    const handleMediaLoad = () => {
        setTimeout(() => {
            setLoaded(true)
        }, 100)  
    }
      
    const preloadingClass = `lazy-media preloading ${preload ? '' : 'hidden'}`
    const loadingClass = `lazy-media loading ${loaded || preload ? 'hidden' : ''}`
    const loadedClass = `lazy-media loaded ${!loaded ? 'hidden' : ''}`


    const mediaStyle = aspectRatio === "original" && mediaWidth && mediaHeight 
                          ? {aspectRatio: `1/${mediaHeight/mediaWidth}`}
                          : {}    
    
    return (
        <>
            <img src={pixelImage} title={alt} className={preloadingClass} style={mediaStyle} />
            {mediaUrl && <img src={blurMediaUrl} title={alt} className={loadingClass} style={mediaStyle} />}
            {!isVideo && mediaUrl && <img src={mediaUrl} title={alt} className={loadedClass} onLoad={handleMediaLoad} style={mediaStyle} />}
            {isVideo && mediaUrl && <video autoPlay loop muted ref={videoRef} src={mediaUrl} className={loadedClass} onLoadedMetadata={handleMediaLoad} style={mediaStyle} />}
        </>
    )    
}
