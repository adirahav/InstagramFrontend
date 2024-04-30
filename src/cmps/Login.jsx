import { useEffect, useState, useRef } from "react"
import { userService } from "../services/user.service"
import { LoadingIcon } from "../assets/icons"
import { login } from "../store/actions/user.actions"
import { NavLink, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { utilService } from "../services/util.service"

export function Login() {
    const [passwordButton, setPasswordButton] = useState({display: false, text: 'Show', inputType: 'password'})
    const [enableLoginButton, setEnableLoginButton] = useState(false)
    const [triggeSubmit, setTriggeSubmit] = useState(null)
    const [fieldValidation, setFieldValidation] = useState({ 
        identifier: {display: false, type: null}, 
        password: {display: false, type: null} 
    })
    const isLoading = useSelector(storeState => storeState.appModule.isLoading)
    const loggedinUser = useSelector(storeState => storeState.userModule.loggedinUser)

    const formRef = useRef()
    const identifierRef = useRef()
    const passwordRef = useRef()
    const navigator = useNavigate()

    useEffect(() => {
        if (loggedinUser && window.location.hash !== "#/") {
            navigator("/")
        }
    }, [loggedinUser])

    const handleInputFocus = (event) => {
        
        const { name } = event.target
        
        setFieldValidation(
            (prevFieldValidation) => {
                switch (name) {
                    case "identifier":                        
                        return { ...prevFieldValidation, identifier: { ...prevFieldValidation.identifier, display: false } }
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
                    case "identifier":  {
                        const display = value !== ""
                        const type = display 
                                        ? utilService.isValidUsername(value) || utilService.isValidEmail(value) || utilService.isValidPhoneNumber(value) ? "valid" : "invalid"  
                                        : ""                   
                        return { ...prevFieldValidation, identifier: { ...prevFieldValidation.identifier, display: display, type: type } }
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
        
        const resetFormFields = () => {
            /*identifierRef.current.focus()
            
            identifierRef.current.setSelectionRange(identifierRef.current.value.length, identifierRef.current.value.length)
            identifierRef.current.value
            
            identifierRef.field.getDOMNode().value
            
            if (formRef.current) {
                formRef.current.reset()
            }*/
        }

        const timeoutId = setTimeout(resetFormFields, 2000)
        return () => clearTimeout(timeoutId)
    }, [])

    useEffect(() => {
        setEnableLoginButton(
            (prevEnableLoginButton) => {
                const allFieldsValid = Object.values(fieldValidation).every(field => {
                    if (field.type === null) {

                    }
                    return field.display === true && field.type === 'valid'
                })
                
                return allFieldsValid
            }
        )
    }, [fieldValidation])

    useEffect(() => {
        if (triggeSubmit !== null) {
            handelOnSubmit(triggeSubmit)
            setTriggeSubmit(null)
        }

        setEnableLoginButton(
            (prevEnableLoginButton) => {
                const allFieldsValid = Object.values(fieldValidation).every(field => {
                    if (field.type === null) {

                    }
                    return field.display === true && field.type === 'valid'
                })
                
                return allFieldsValid
            }
        )
    }, [enableLoginButton])

   
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

    const handelOnSubmit = async (event) => {
        if (!enableLoginButton || isLoading) {
            return
        }

        event.preventDefault()
        try {
            await login({identifier: identifierRef.current.value, password: passwordRef.current.value})
        } catch (error) {
            console.error("Error during login:", error)
        }
        
    }

    const onDemoUserPress = async () => {
        try {
            await login({identifier: "demo", password: "Aa123456!"})
        } catch (error) {
            console.error("Error during log in with demo user:", error)
        }
    }

    const passwordButtonStyle = passwordButton.display ? 'inline' : 'none'
    
    return (
        <>
            <form className="signin" ref={formRef}>
                <article>
                    {/*<i className="logo" />*/}
                    <h2 className="logo">Instaglam</h2>
                    <div className="input">
                        <label>
                            <input ref={identifierRef} onFocus={handleInputFocus} onBlur={handleInputBlur} onChange={handleInputChanged} onKeyDown={handleKeyDown} required autoCapitalize="off" autoCorrect="off" autoComplete="off" maxLength="75" type="text" name="identifier"></input>
                            <span>Phone number, username, or email</span>
                        </label>
                    </div>
                    
                    <div className="input">
                        <label>
                            <input ref={passwordRef} onFocus={handleInputFocus} onBlur={handleInputBlur} onChange={handleInputChanged} onKeyDown={handleKeyDown} required autoCapitalize="off" autoCorrect="off" autoComplete="off" type={passwordButton.inputType} name="password"></input>
                            <span>Password</span>
                            <button type="button" onClick={handleDisplayPasswordChanged} style={{display:passwordButtonStyle}}>{passwordButton.text}</button>
                        </label>
                    </div>

                    <div className="buttons">
                        <button type="submit" disabled={!enableLoginButton} onClick={handelOnSubmit}>
                            {!isLoading && <span>Log in</span>}
                            {isLoading && <LoadingIcon.button />}
                        </button>
                    </div>

                    <div className="or"><span /><span>OR</span><span /></div>

                    <div className="demo">Log in with <NavLink onClick={onDemoUserPress}>demo user</NavLink></div>
                </article>
                <article>
                    <div>Don't have an account? <NavLink to="/accounts/emailsignup/">Sign up</NavLink></div>
                </article>
            </form>
        </>
        
    )
}
