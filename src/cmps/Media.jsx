import { useEffect, useState, useRef } from "react"
import { MovieIcon,PictureIcon, MuteIcon } from "../assets/icons"
import createThumbnail from "react-thumbnail-creator"
import { LazyLoadMedia } from "./LazyLoadMedia"

export function Media({media, isMediaPreview = false, aspectRatio = "square"}) { // aspectRatio: "square" | "original"
    const [isUserStoppedVideo, setIsUserStoppedVideo] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [videoThumbnail, setVideoThumbnail] = useState(null)

    const videoRef = useRef(null)
    const MIN_VIDEO_TO_PLAY_DISPLAY_PERCENT = 0.3

    useEffect(() => {
        if (isMediaPreview && media.url && media.type === "video") {
            creatVideoThumbnail(media.url)
        }
    
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0]
            if (!isMediaPreview) {
                if (!isUserStoppedVideo) {
                    if (entry.intersectionRatio < MIN_VIDEO_TO_PLAY_DISPLAY_PERCENT) {
                        pauseVideo()
                    } else {
                        playVideo()
                    }
                } 
            }
                   
        }, { threshold: MIN_VIDEO_TO_PLAY_DISPLAY_PERCENT })

        if (videoRef.current instanceof Element) {
            observer.observe(videoRef.current)
        }

        return () => {
            if (observer) {
                observer.disconnect()
            }
        }
    }, [media])

    async function creatVideoThumbnail(videoURL) {
        try {
            const thumbnail = await createThumbnail({
                url: videoURL,
                timeStamp: 6,
            })
            setVideoThumbnail(thumbnail)
        } catch (error) {
            console.error("Error creating video thumbnail:", error)
        }
    } 

    const playVideo = () => {
        if (videoRef.current) {
            videoRef.current.play()
        }
    }

    const pauseVideo = () => {
        if (videoRef.current) {
            videoRef.current.pause()
        }
    }

    const handlePressVideo = () => {
        const video = videoRef.current
        if (video) {
            if (video.paused) {
                video.play()
                setIsUserStoppedVideo(false)
            } else {
                video.pause()
                setIsUserStoppedVideo(true)
            }
        }
    }    

    const handlePressSound = (event) => {
        event.preventDefault()
        event.stopPropagation()

        if (videoRef.current) {
            videoRef.current.muted = !videoRef.current.muted
            setIsMuted(!isMuted)
        }
    }
    
    const playClass = (!isUserStoppedVideo ? "hide-content " : "") + "play"
    
    if (!media) return <></>

    return (
        <div className="media round">
            {media.type === "image" && !isMediaPreview  && <LazyLoadMedia mediaUrl={media.url} mediaWidth={media.width} mediaHeight={media.height} isVideo={false} alt={media.alt} aspectRatio={aspectRatio} />}
            {media.type === "image" && isMediaPreview && <div className="preview">
                    <LazyLoadMedia mediaUrl={media.url} mediaWidth={media.width} mediaHeight={media.height} isVideo={false} alt={media.alt} />
                    <PictureIcon.preview />
                </div>}
            {media.type === "video" && !isMediaPreview && <div className="video" onClick={handlePressVideo}>
                    <LazyLoadMedia mediaUrl={media.url} mediaWidth={media.width} mediaHeight={media.height} isVideo={true} videoRef={videoRef} />
                    <span className={playClass}><span><span></span></span></span>
                    <span className="sound"><span><button onClick={handlePressSound}>
                        {isMuted && <MuteIcon.muted />}
                        {!isMuted && <MuteIcon.sounded />}
                    </button></span></span>
                </div>}
            {media.type === "video" && isMediaPreview && <div className="preview">
                    <LazyLoadMedia mediaUrl={videoThumbnail} mediaWidth={media.width} mediaHeight={media.height} isVideo={false} alt={media.alt} />
                    <MovieIcon.preview />
                </div>}
        </div>
    )
        
}
