import { Outlet } from "react-router-dom";

export default function ErrorLayout() {
    return (

        <div className="w-screen h-screen">
            <Outlet />
        </div>
    
)
}