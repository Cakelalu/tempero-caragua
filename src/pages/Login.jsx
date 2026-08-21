import { NavLink } from "react-router"

export default function Login() {
    return (
        <>
            <section className='grid '>
            <div className="bg-pallete-dark-green-2 w-screen min-h-screen flex flex-col items-center justify-center gap-3">

                <h1 className="text-white">Logo</h1>
                <br />
                <p className="font-bold">Acesse sua conta</p>
                <form action="" className="flex flex-col gap-2  align-center justify-center w-1/4">
                    <label htmlFor="email font-bold">E-mail</label>
                    <input type="text" placeholder="E-mail" className="border border-white rounded p-2 font-bold" />
                    <label htmlFor="password font-bold">Senha</label>
                    <input type="password" placeholder="Senha" className="border border-white rounded p-2 font-bold" />
                    <button type="submit" className="bg-pallete-orange text-white rounded p-2 w-45 hover:underline">Entrar</button>
                </form>

            </div>

            <div>

            </div>
            </section>
        </>
    )
}