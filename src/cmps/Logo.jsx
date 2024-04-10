import { NavLink } from "react-router-dom"
import { LogoIcon } from "../assets/icons"

export function Logo() {
    return (
        <div className="logo">
           <NavLink to="/"><LogoIcon.small /><LogoIcon.text /></NavLink>
        </div>
    )
}
