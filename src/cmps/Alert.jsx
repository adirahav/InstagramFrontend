import { useEffect, useState, useRef } from "react"
import { eventBusService } from "../services/event-bus.service"

window.showSuccessAlert = showSuccessAlert
window.showWarningAlert = showWarningAlert
window.showErrorAlert = showErrorAlert
window.showMessageAlert = showMessageAlert

export function Alert() {
    
    const [displayAlert, setDisplayAlert] = useState(false)    
    const [type, setType] = useState('message')    // error | warning | success | message
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [okButton, setOKButton] = useState({show: true, text: "", onPress: null, closeAfterPress: true})
    const [cancelButton, setCancelButton] = useState({show: true, text: "", onPress: null, closeAfterPress: true})
    const [closeButton, setCloseButton] = useState({show: false, autoClose: false, autoCloseSeconds: 3})
    const modalRef = useRef()

    useEffect(() => {
        const unsubscribe = eventBusService.on('show-alert', (data) => {
            setType(data.type ?? type)
            setTitle(data.title)
            setMessage(data.message)
            setOKButton({ ...okButton, ...data.okButton })
            setCancelButton({ ...cancelButton, ...data.cancelButton })
            setDisplayAlert(true)

            setCloseButton((prevCloseButton) => {
                const _closeButton = { ...closeButton, ...data.closeButton }
                
                if (_closeButton && _closeButton.autoClose) {
                    setTimeout(() => {
                        onClose()
                    }, _closeButton.autoCloseSeconds * 1000)
                }
    
                return _closeButton
            }) 
        })

        return unsubscribe
    }, [type, title, message, okButton, cancelButton, closeButton])

    useEffect(() => {
        if (type && title && message && okButton && cancelButton || closeButton) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside)
            }, 0)
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }

    }, [type, title, message, okButton, cancelButton, closeButton])


    function onClose() {
        setType(null)
        setTitle(null)
        setMessage(null)
        setOKButton(null)
        setCancelButton(null)
        setCloseButton(null)
        setDisplayAlert(false)
    }

    function handleButton(button) {
        if (button === null) {
            return
        }

        if (button.onPress !== null) {
            button.onPress()
        }
        
        if (button.closeAfterPress) {
            onClose()
        }
    }

    function handleClickOutside(ev) {
        if (modalRef.current && !modalRef.current.contains(ev.target)) {
            onClose()
        }
    }

    if (!displayAlert) return <></>

    return (
        <div className={"alert " + type} ref={modalRef}>
            <header>
                <h2>{title}</h2>
                {closeButton.show && <CloseIcon sx={ IconSizes.Small } onClick={onClose} />}
            </header>
            <section className="message">
                {typeof message === "string" ? <p>{message.replace(/<br\s*\/?>/g, '\n')}</p> : message}
            </section>
            <section className="buttons">
                {okButton.show && <button className="ok" onClick={() => handleButton(okButton)}>{okButton.text}</button>}
                {cancelButton.show && <button className="cancel" onClick={() => handleButton(cancelButton)}>{cancelButton.text}</button>}
            </section>
        </div>
    )
}

function showAlert(data) {
    eventBusService.emit('show-alert', data)
}

export function showErrorAlert(data) {
    showAlert({ ...data, type: 'error' })
}

export function showWarningAlert(data) {
    showAlert({ ...data, type: 'warning' })
}

export function showSuccessAlert(data) {
    showAlert({ ...data, type: 'success' })
}

export function showMessageAlert(data) {
    showAlert({ ...data, type: 'message' })
}