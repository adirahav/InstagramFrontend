import { useDispatch, useSelector } from "react-redux"
import { GET_DYNAMIC_MODAL_DATA } from "../store/reducers/app.reducer"
import { useEffect, useRef } from "react"
import { utilService } from "../services/util.service"

export function DynamicModal() {
    const modalData = useSelector((storeState) => storeState.appModule.modalData)
    const dispatch = useDispatch()
    const modalRef = useRef()

    useEffect(() => {

        if (modalData) {
            setTimeout(() => {
                document.addEventListener('click', handleClickOutside)
            }, 0)
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }

    }, [modalData])

    if (!modalData) return <></>

    const Cmp = modalData?.cmp

    function onCloseModal() {
        modalData.props.onCloseModal()
        dispatch({ type: GET_DYNAMIC_MODAL_DATA, modalData: null })
    }

    function handleClickOutside(ev) {
        
        if (modalRef.current && !modalRef.current.contains(ev.target)) {
            const rootParent = utilService.findRootParent(ev.target)
            
            if (rootParent.className.animVal?.includes("icon-liked") || 
                rootParent.className.animVal?.includes("icon-unliked") ||
                rootParent.className.animVal?.includes("icon-saved") || 
                rootParent.className.animVal?.includes("icon-unsaved")) {
                return 
            }
             
            onCloseModal(!rootParent.className.includes('avatar'))
        }
        else {
            if (ev.srcElement.className.includes("hashtag") || ev.srcElement.className.includes("user-profile")) {
                onCloseModal()
            }
        }
    }
    
    const modalType = `dynamic-modal ${modalData.props.type}`

    return (
        <div ref={modalRef} className={modalType}>
            {Cmp && <Cmp {...modalData.props} />}
            {/*<CloseIcon.default />*/}
        </div>
    )
}