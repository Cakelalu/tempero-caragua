import { TbFaceIdError } from "react-icons/tb";

export default function NotFound() {
    return(
        <div className='h-full w-full flex flex-col items-center justify-center dark:bg-[var(--color-pallete-surface-dark)]'>
            <TbFaceIdError className="text-5xl" />
            <h1 className="text-2xl font-bold dark:text-[var(--color-text-primary-dark)]" >Esta página não existe...</h1>
        </div>
    )
}