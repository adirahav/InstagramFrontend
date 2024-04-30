import { useEffect, useState, useRef } from "react"
import { userService } from "../services/user.service"
import { LoadingIcon } from "../assets/icons"
import { NavLink, useNavigate } from "react-router-dom"
import { utilService } from "../services/util.service"
import { Avatar } from "./Avatar"
import { imageUploadService } from "../services/image-upload.service"
import { useSelector } from "react-redux"
import { signup, updateUser } from "../store/actions/user.actions"
import { onLoadingDone, onLoadingStart } from "../store/actions/app.actions"

export function Signup() {
    const [passwordButton, setPasswordButton] = useState({display: false, text: 'Show', inputType: 'password'})
    const [enableSignupButton, setEnableSignupButton] = useState({ disable: true, loading: false })
    const [triggeSubmit, setTriggeSubmit] = useState(null)
    const [fieldValidation, setFieldValidation] = useState({ 
        contact: {display: false, type: null}, 
        username: {display: false, type: null}, 
        fullname: {display: false, type: null}, 
        password: {display: false, type: null} 
    })

    const isLoading = useSelector(storeState => storeState.appModule.isLoading)
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)

    const contactRef = useRef()
    const usernameRef = useRef()
    const fullnameRef = useRef()
    const passwordRef = useRef()
    const fileInputRef = useRef()

    const navigate = useNavigate()

    const STEP_FORM = 1
    const STEP_PROFILE_PICTURE = 2
    const [step, setStep] = useState(STEP_FORM)
    
    const handleInputFocus = (event) => {
        const { name } = event.target
        
        setFieldValidation(
            (prevFieldValidation) => {
                switch (name) {
                    case "contact":                        
                        return { ...prevFieldValidation, contact: { ...prevFieldValidation.contact, display: false } }
                    case "username":                        
                        return { ...prevFieldValidation, username: { ...prevFieldValidation.username, display: false } }
                    case "fullname":                        
                        return { ...prevFieldValidation, fullname: { ...prevFieldValidation.fullname, display: false } }
                    case "password":                        
                        return { ...prevFieldValidation, password: { ...prevFieldValidation.password, display: false } }
                    default:
                        return prevFieldValidation
                }
                
            }
        )
    }

    const handleInputBlur = (event) => {
        const { name, value } = event.target
        
        setFieldValidation(
            (prevFieldValidation) => {
                switch (name) {
                    case "contact":  {
                        const display = value !== ""
                        const type = display 
                                        ? utilService.isValidEmail(value) || utilService.isValidPhoneNumber(value) ? "valid" : "invalid"  
                                        : ""                   
                        return { ...prevFieldValidation, contact: { ...prevFieldValidation.contact, display: display, type: type } }
                    }
                    case "fullname":  {
                        const display = value !== ""
                        const type = display 
                                        ? value.length > 0 ? "valid" : "invalid"  
                                        : ""                   
                        return { ...prevFieldValidation, fullname: { ...prevFieldValidation.fullname, display: display, type: type } }
                    }
                    case "username":  {
                        const display = value !== ""
                        const type = display 
                                        ? utilService.isValidUsername(value) ? "valid" : "invalid"  
                                        : ""                   
                        return { ...prevFieldValidation, username: { ...prevFieldValidation.username, display: display, type: type } }
                    }
                    case "password":  {
                        const display = value !== ""
                        const type = display 
                                        ? utilService.isValidPassword(value) ? "valid" : "invalid"  
                                        : ""                   
                        return { ...prevFieldValidation, password: { ...prevFieldValidation.password, display: display, type: type } }
                    }
                    default:
                        return prevFieldValidation
                }
            }
        )
    }

    useEffect(() => {
        setEnableSignupButton(
            (prevEnableSignupButton) => {
                if (step === STEP_FORM) {
                    const allFieldsValid = Object.values(fieldValidation).every(field => {
                        return field.display === true && field.type === 'valid'
                    })
                    
                    return allFieldsValid
                }
                
                return prevEnableSignupButton
            }
        )
    }, [fieldValidation])

    useEffect(() => {
        if (triggeSubmit !== null) {
            handelOnNext(triggeSubmit)
            setTriggeSubmit(null)
        }

        setEnableSignupButton(
            (prevEnableSignupButton) => {
                const allFieldsValid = Object.values(fieldValidation).every(field => {
                    if (field.type === null) {

                    }
                    return field.display === true && field.type === 'valid'
                })
                
                return allFieldsValid
            }
        )
    }, [enableSignupButton])

    const handleInputChanged = (event) => {
        const { name, value } = event.target

        switch (name) {
            case "password":  {
                setPasswordButton(
                    (prevPasswordButton) => {
                        return {...prevPasswordButton, display: !!value}
                    }
                )
            }
        }
    }

    const handleDisplayPasswordChanged = (event) => {
        setPasswordButton(
            (prevPasswordButton) => {
                if (prevPasswordButton.display) {
                    if (prevPasswordButton.text === "Show") {
                        return { ...prevPasswordButton, text: "Hide", inputType: 'text' }
                    }
                    else {
                        return { ...prevPasswordButton, text: "Show", inputType: 'password' }
                    }
                }
                return prevPasswordButton
            }
        )
    }

    const handleKeyDown = async (event) => {
        if (event.key === 'Enter') {
            event.target.blur()
            setTriggeSubmit(event)
        }
    }

    const handelOnNext = async (event) => {
        if (!enableSignupButton || isLoading) {
            return
        }
        
        event.preventDefault()

        if (step == STEP_FORM) {
            try {
                await signup({ contact: contactRef.current.value, fullname: fullnameRef.current.value, username: usernameRef.current.value, password: passwordRef.current.value })
                setStep(STEP_PROFILE_PICTURE)
            } catch (error) {
                console.error("Error during signup:", error)
            }
        }
    }

    const handelOnSkip  = async (event) => {
        navigate("/")
    }
    
    const onAvatarPress = (event) => {
        event.preventDefault()

        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    async function uploadProfilePicture(event) {
        event.preventDefault()

        onLoadingStart()
        const { secure_url, height, width } = await imageUploadService.uploadMedia(event.target.files)
        
        try {
            await updateUser({...loggedinUser, profilePicture: secure_url})
        } catch (error) {
            console.error("Error during update profile picture:", error)
        }
        
        setTimeout(() => {
            onLoadingDone()
            navigate("/")
        }, 2500)
    }

    const passwordButtonStyle = passwordButton.display ? 'inline' : 'none'
    
    return (
        <>
            <section className="signin">
                {step === STEP_FORM && <form onSubmit={handelOnNext} >
                    {/*<i className="logo has-summary" />*/}
                    <h2 className="logo has-summary">Instaglam</h2>
                    <div className="summary">
                        Sign up to see photos and videos from your friends.
                    </div>
                    <div className="input">
                        <label>
                            <input ref={contactRef} onFocus={handleInputFocus} onBlur={handleInputBlur} onChange={handleInputChanged} onKeyDown={handleKeyDown} required autoCapitalize="off" autoCorrect="off" type="text" name="contact"></input>
                            <span>Mobile Number or Email</span>
                            {fieldValidation.contact.display && <span className={`icon ${fieldValidation.contact.type}`} />}
                        </label>
                    </div>
                    <div className="input">
                        <label>
                            <input ref={fullnameRef} onFocus={handleInputFocus} onBlur={handleInputBlur} onChange={handleInputChanged} onKeyDown={handleKeyDown} required autoCapitalize="off" autoCorrect="off" type="text" name="fullname"></input>
                            <span>Full Name</span>
                            {fieldValidation.fullname.display && <span className={`icon ${fieldValidation.fullname.type}`} />}
                        </label>
                    </div>
                    <div className="input">
                        <label>
                            <input ref={usernameRef} onFocus={handleInputFocus} onBlur={handleInputBlur} onChange={handleInputChanged} onKeyDown={handleKeyDown} required autoCapitalize="off" autoCorrect="off" maxLength="30" type="text" name="username"></input>
                            <span>Username</span>
                            {fieldValidation.username.display && <span className={`icon ${fieldValidation.username.type}`} />}
                        </label>
                    </div>
                    
                    <div className="input">
                        <label>
                            <input ref={passwordRef} onFocus={handleInputFocus} onBlur={handleInputBlur} onChange={handleInputChanged} onKeyDown={handleKeyDown} aria-label="Password" required autoCapitalize="off" autoCorrect="off" autoComplete="off" type={passwordButton.inputType} name="password"></input>
                            <span>Password</span>
                            <button type="button" onClick={handleDisplayPasswordChanged} style={{display:passwordButtonStyle}}>{passwordButton.text}</button>
                            {fieldValidation.password.display && <span className={`icon ${fieldValidation.password.type}`} />}
                        </label>
                    </div>

                    <div className="buttons">
                        <button type="submit" disabled={!enableSignupButton}>
                            {!isLoading && <span>Sign up</span>}
                            {isLoading && <LoadingIcon.button />}
                        </button>
                    </div>
                </form>}
                {step === STEP_PROFILE_PICTURE && <form onSubmit={handelOnSkip} >
                    {/*<i className="logo" />*/}
                    <h2 className="logo">Instaglam</h2>
                    <main className="upload">
                        <label htmlFor="uploadProfilePicture" className="file-upload">
                            <Avatar disabled={isLoading} size="huge" hasBorder={false} textPosition="none" user={loggedinUser} onPress={onAvatarPress} />
                            <input style={{ display: 'none' }} disabled={isLoading} type="file" onChange={uploadProfilePicture} accept="image/*,video/*" id="imgUpload" ref={fileInputRef} />
                        </label>
                    </main>
                    
                    <div className="buttons">
                        <button type="submit" disabled={!enableSignupButton} onClick={onAvatarPress}>
                            {!isLoading && <span>Upload your profile photo</span>}
                            {isLoading && <LoadingIcon.button />}
                        </button>
                        <button>Skip</button>
                    </div>
                </form>}
                <article>
                    <div>Have an account? <NavLink to="/accounts/login/">Log in</NavLink></div>
                </article>
            </section>
        </>
        
    )
}
