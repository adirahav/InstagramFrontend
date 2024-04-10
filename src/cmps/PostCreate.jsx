import { useEffect, useRef, useState } from "react"
import { onLoadingDone, onLoadingStart } from "../store/actions/app.actions"
import { BackIcon, DragMediaIcon, LoadingIcon, AccordionIcon } from "../assets/icons"
import { imageUploadService } from "../services/image-upload.service"
import { addPost } from "../store/actions/post.actions"
import { openaiService } from "../services/openai.service"
import { utilService } from "../services/util.service"
import createThumbnail from "react-thumbnail-creator"
//import { Configuration, OpenAIApi} from "openai"
import { eventBusService } from "../services/event-bus.service"
import {CopyToClipboard} from 'react-copy-to-clipboard'
import { useSelector } from "react-redux"
import { Avatar } from "./Avatar"

export function PostCreate({onCloseModal}) {
    const [step, setStep] = useState(1)
    const [mediaData, setMediaData] = useState(null)
    const refTextarea = useRef()
    const refAlt = useRef()
    const STEPS_COUNT = 2

    const handleBack = () => {
        
        if (step - 1 === 1) {
            showWarningAlert({
                title: "Discard post?",
                message: "If you leave, your edits won't be saved.",
                closeButton: { show: false },
                okButton: { show: true, text: "Discard", onPress: () => { onCloseModal() }, closeAfterPress: true },
                cancelButton: { show: true, text: "Cancel", onPress: null, closeAfterPress: true },
            })
        } else {
            setStep(step - 1)
        }
    }

    const handleNext = async (params) => {
        if (step === STEPS_COUNT) {
            await addPost(refTextarea.current.value, mediaData, refAlt.current.value)
            onCloseModal()
        } else {
            if (params) {
                setMediaData(params)
            }
            setStep(step + 1)
        }
    }

    return (
        <>
            {step === 1 && <Step1 onClickNext={handleNext} />}
            {step === 2 && <Step2 onClickBack={handleBack} onClickNext={handleNext} mediaData={mediaData} refTextarea={refTextarea} refAlt={refAlt} />}
        </>
    )

    function Step1({onClickNext}) {
        const [isDragging, setIsDragging] = useState(false)
        const isLoading = useSelector(storeState => storeState.appModule.isLoading)
        const fileInputRef = useRef()

        // browse
        const onTriggerUploadMedia = (event) => {
            event.preventDefault()

            if (fileInputRef.current) {
                fileInputRef.current.click()
            }
        }

        const browseMedia = (event) => {
            event.preventDefault()
            uploadMedia(event.target.files)
        }
        
        // drag and drop
        const handleDragEnter = (event) => {
            event.preventDefault()
            event.stopPropagation()
            setIsDragging(true)
        }

        const handleDragLeave = (event) => {
            event.preventDefault()
            event.stopPropagation()
            setIsDragging(false)
        }

        const handleDragOver = (event) => {
            event.preventDefault()
            event.stopPropagation()
        }

        const handleDrop = (event) => {
            event.preventDefault()
            event.stopPropagation()

            setIsDragging(false)
            const files = event.dataTransfer.files
            uploadMedia(files)
        }

        // upload
        async function uploadMedia(files) {
            onLoadingStart()
            const { secure_url, height, width } = await imageUploadService.uploadMedia(files)
            onLoadingDone()
            onClickNext({url: secure_url, width, height})
        }


        // ai image
        //////////////////
        async function generateImage() {
            /*const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY
            })
            const openai = new OpenAIApi(configuration)
            const response = await openai.createCompletion({
                model: "text-devinci-002",
                prompt: "Say this is a test",
                temperature: 0,
                max_tokens: 6
            })
            */
        }
        
        useEffect(() => {
            generateImage()
        }, [])

        //////

        return  <>
            <header>
                <span></span>
                <h2>Create new post</h2>
                <span></span>
            </header>
            <main className={`upload ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}>
                <DragMediaIcon.default onChange={onTriggerUploadMedia} />
                <p>Drag photos and videos here</p>
                <label htmlFor="imgUpload" className="file-upload">
                    <button disabled={isLoading} onClick={onTriggerUploadMedia}>
                        {!isLoading && <span>Select from computer</span>}
                        {isLoading && <LoadingIcon.button />}
                    </button>
                    <input disabled={isLoading} type="file" onChange={browseMedia} accept="image/*,video/*" id="imgUpload" ref={fileInputRef} />
                </label>
            </main>
        </>
    }

    function Step2({onClickBack, onClickNext, mediaData, refTextarea, refAlt}) {
        const [charactersCounter, setCharactersCounter] = useState(0)
        const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)
        const [isAccessibilityOn, setIsAccessibilityOn] = useState(false)
        const [isAIGeneratorOn, setIsAIGeneratorOn] = useState(false)
        const [aiGeneratedText, setAIGeneratedText] = useState('')
        const [disableAIGeneratedButton, setDisableAIGeneratedButton] = useState(true)
        const [mediaThumbnail, setMediaThumbnail] = useState(mediaData && mediaData.url && utilService.getMediaType(mediaData.url) === "video" ? null : mediaData)
        const refAIGenerator = useRef()

        const MAX_CHARACTERS = 2200

        // media
        useEffect(() => {
            if (mediaData && mediaData.url && utilService.getMediaType(mediaData.url) === "video") {
                creatVideoThumbnail(mediaData)
            }
        }, [mediaData])

        async function creatVideoThumbnail(video) {
            try {
                const thumbnail = await createThumbnail({
                    url: video.url,
                    timeStamp: 6,
                })

                setMediaThumbnail({url: thumbnail})
                
            } catch (error) {
                console.error("Error creating video thumbnail:", error)
            }
        } 

        // text
        const handleTextareaChange = (ev) => {
            const text = ev.target.value
            setCharactersCounter(text.length)
        }

        // accessibility
        const handleDisplayAccessibility = () => {
            setIsAccessibilityOn(!isAccessibilityOn)
            setIsAIGeneratorOn(false)
        }

        // ai generator
        const handleDisplayAIGenerator = () => {
            setIsAccessibilityOn(false)
            setIsAIGeneratorOn(!isAIGeneratorOn)
        }

        const handleAIGeneratorTextareaChanged = () => {
            const textarea = refAIGenerator.current
        
            if (textarea) {
                setDisableAIGeneratedButton(textarea.value.length === 0)
            }
        }

        const handleAIGeneratorTextareaKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault()
                    
                if (event.shiftKey) {
                    const textarea = refAIGenerator.current
                    const cursorPosition = textarea.selectionStart
                    const textBeforeCursor = textarea.value.substring(0, cursorPosition)
                    const textAfterCursor = textarea.value.substring(cursorPosition)
                    textarea.value = textBeforeCursor + '\n' + textAfterCursor
                } else  {
                    handleGenerateText()
                }
            }
        }
        
        const handleGenerateText = async () => {
            eventBusService.emit('generate-ai-text', {textToGenerate: refAIGenerator.current.value})
        }

        const accessibilityClass = `accordion accessibility ${isAccessibilityOn ? 'on' : 'off'}`  
        const aiGeneratorClass = `accordion ai-generation ${isAIGeneratorOn ? 'on' : 'off'}`  

        return  <>
            <header>
                <BackIcon.desktop onClick={onClickBack} />
                <BackIcon.mobile onClick={onClickBack} />
                <h2>Create new post</h2>
                <span onClick={onClickNext}>Share</span>
            </header>
            <main className="share">
                <section className="desktop">
                    {mediaThumbnail && <img src={mediaThumbnail.url} />}
                </section>
                <section>
                    <article className="caption">
                        <Avatar size="tiny" textPosition="right" hasBorder={false} user={loggedinUser} />
                        
                        {mediaThumbnail && <img className="mobile" src={mediaThumbnail.url} />}

                        <textarea maxLength={MAX_CHARACTERS} ref={refTextarea} onChange={handleTextareaChange} placeholder="Write a caption..." />
                        <div className="counter">{Number(charactersCounter).toLocaleString()}/{Number(MAX_CHARACTERS).toLocaleString()}</div>
                    </article>
                    
                    <article className="more-option">
                        <div className={accessibilityClass}>
                            <header onClick={handleDisplayAccessibility}>
                                <h2>Accessibility</h2><AccordionIcon.down />
                            </header>
                            <main>
                                <span>Alt text describes your photos for people with visual impairments. Alt text will be automatically created for your photos or you can choose to write your own.</span>
                                <div>{mediaThumbnail && mediaThumbnail.url && <img src={mediaThumbnail.url} />}<input ref={refAlt} placeholder="Write alt text..." /></div>
                            </main>
                        </div>
                        <div className={aiGeneratorClass}>
                            <header onClick={handleDisplayAIGenerator}>
                                <h2>AI-Powered Text Generation</h2><AccordionIcon.down />
                            </header>
                            <main>
                                <span>Transform your ideas into captivating narratives effortlessly with the power of artificial intelligence.</span>
                                <div className="textarea">
                                    <textarea ref={refAIGenerator} placeholder="Write your idea..." onChange={handleAIGeneratorTextareaChanged} onKeyDown={handleAIGeneratorTextareaKeyDown} />
                                    <button onClick={handleGenerateText} disabled={disableAIGeneratedButton}>Generate</button>
                                </div>
                            </main>
                        </div>

                    </article>
                </section>
            </main>
            <GenerateAITextModal />
        </>
    }

    function GenerateAITextModal() {
        const [displayModal, setDisplayModal] = useState(false)    
        const [textToGenerate, setTextToGenerate] = useState('')
        const [generatedText, setGeneratedText] = useState('')
        const modalRef = useRef()
        
        useEffect(() => {
            const unsubscribe = eventBusService.on('generate-ai-text', (data) => {
                setTextToGenerate(data.textToGenerate)
                setGeneratedText('')
                setDisplayModal(true)
            })

            return unsubscribe
        }, [displayModal, textToGenerate])

        useEffect(() => {
            if (!textToGenerate) {
                return 
            }
            
            handleGenerateText()

            if (textToGenerate) {
                setTimeout(() => {
                    document.addEventListener('click', handleClickOutside)
                }, 0)
            }

            return () => {
                document.removeEventListener('click', handleClickOutside)
            }

        }, [displayModal, textToGenerate])


        function onClose() {
            setTextToGenerate('')
            setGeneratedText('')
            setDisplayModal(false)
        }

        const handleChangeGeneratedText = (ev) => {
            setGeneratedText(ev.target.value)
        }

        async function handleGenerateText() {
            try {
                const generatedText = await openaiService.generatePost(textToGenerate)
                setGeneratedText(generatedText)
            } catch (error) {
                console.error("Error generating text:", error)
            }
        }

        function handleClose() {
            setTimeout(()=> {
                onClose()
            }, 0)
        }

        function handleClickOutside(ev) {
            if (modalRef.current && !modalRef.current.contains(ev.target)) {
                onClose()
            }
        }
        
        if (!displayModal) return <></>

        return (
            <div className="ai-generator-modal" ref={modalRef}>
                <header>
                    <CopyToClipboard text={generatedText} onCopy={handleClose}>
                        <h2>COPY</h2>
                    </CopyToClipboard>
                </header>
                <section className="content">
                    <div style={{margin: '0 10px', fontSize: '12px', color: '#ff3040'}}>* Dummy content creation due to disabling free tier open ai</div>
                    <textarea onChange={handleChangeGeneratedText} value={generatedText}></textarea>
                </section>
                <section className="buttons">
                    <button className="ok" onClick={handleGenerateText}>Generate Again</button>
                    <button className="cancel" onClick={handleClose}>Close</button>
                </section>
            </div>
        )
    }
}