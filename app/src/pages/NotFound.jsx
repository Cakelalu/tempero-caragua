import { TbFaceIdError } from "react-icons/tb";

export default function NotFound() {
    return(
        <div className='h-full w-full flex flex-col items-center justify-center '>
            <TbFaceIdError className="text-5xl" />
            <h1 className="text-2xl font-bold" >Esta página não existe...</h1>
        </div>
    )
}