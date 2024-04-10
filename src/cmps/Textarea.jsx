import { NavLink } from "react-router-dom"
import missingAvatar from '../assets/images/missing-avatar.jpg'
import { useEffect, useRef, useState } from "react"


export function Textarea({mainRef, placeholder, button}) {

    const textareaRef = useRef(null)
    const [mainHeight, setMainHeight] = useState(null)
    const [textareaHeight, setTextareaHeight] = useState(null)
    const [disableButton, setDisableButton] = useState(true)

    
    useEffect(() => {
        getCSSHeight()
    }, [])

    function getCSSHeight() {
        const main = mainRef.current
        const textarea = textareaRef.current

        if (main)
        {
            const computedStyles = window.getComputedStyle(main)
            setMainHeight({
                default: Number(computedStyles.getPropertyValue('height').replace("px", "")),
                delta: 0
            })
        }

        if (textarea)
        {
            const computedStyles = window.getComputedStyle(textarea)
            setTextareaHeight({
                min: Number(computedStyles.getPropertyValue('min-height').replace("px", "")),
                max: Number(computedStyles.getPropertyValue('max-height').replace("px", ""))
            })
        }  
    }

    function fixMainCSSHeight() {
        const main = mainRef.current
        const textarea = textareaRef.current
        
        if (main && textarea)
        {
            const delta = textarea.style.height.replace("px", "") - textareaHeight.min
            setMainHeight((prevMainHeight) => { 
                return {
                    ...prevMainHeight,
                    delta: delta
                }
            })

            main.style.height = (mainHeight.default - delta) + "px"
            
        }   
    }

    const handleTextareaHeight = () => {
        const textarea = textareaRef.current
    
        if (textarea) {

            setDisableButton(textarea.value.length === 0)

            if (textarea.scrollHeight <= textareaHeight.min) {
                textarea.style.height = textareaHeight.min + 'px'
            } else if (textarea.value.length <= 30) {
                textarea.style.height = textareaHeight.min + 'px'
            } else {
                textarea.style.height = 'auto'
                textarea.style.height = `${Math.min(textarea.scrollHeight, textareaHeight.max)}px` 
            }

            fixMainCSSHeight()
        }
    }

    const handleTextareaKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
                
            if (event.shiftKey) {
                const textarea = textareaRef.current
                const cursorPosition = textarea.selectionStart
                const textBeforeCursor = textarea.value.substring(0, cursorPosition)
                const textAfterCursor = textarea.value.substring(cursorPosition)
                textarea.value = textBeforeCursor + '\n' + textAfterCursor
            } else  {
                handlAddComment()
            }
        }
    }

    // add comment 
    const handlFocusAddComment = () => {
        const textarea = textareaRef.current
        textarea.focus()
        
    }

    const handleOnButtonClick = async () => {
        const textarea = textareaRef.current
        
        if (textarea) {
            if (button.onClick) {
                button.onClick(textarea.value)
            }
        }
    }

    return (<>
        <textarea placeholder={placeholder} ref={textareaRef} onChange={handleTextareaHeight} onKeyDown={handleTextareaKeyDown}></textarea>
        <button onClick={handleOnButtonClick} disabled={disableButton}>{button.text}</button>
    </>)
}
