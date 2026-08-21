import { NavLink } from "react-router"

export default function Login() {
    return (
        <>
            <section className="grid grid-cols-[70%_30%] min-h-screen w-screen">
                <div className="bg-pallete-dark-green-2 w-full flex flex-col items-center justify-center gap-3">
                    <h1 className="text-white text-3xl font-bold">Logo</h1>
                    <br />
                    <p className="font-bold text-white">Acesse sua conta</p>

                    <form action="" className="flex flex-col gap-2 align-center justify-center w-2/4">
                        <label htmlFor="email" className="font-bold text-white">E-mail</label>
                        <input type="text" placeholder="E-mail" className="border border-white rounded p-2 font-bold text-white" />

                        <label htmlFor="password" className="font-bold text-white">Senha</label>
                        <input type="password" placeholder="Senha" className="border border-white rounded p-2 font-bold text-white" />

                        <button type="submit" className="bg-pallete-orange text-white rounded p-2 w-45 hover:underline mt-2">
                            Entrar
                        </button>
                    </form>
                </div>
                <div className="bg-white flex items-center justify-center p-6">
                    <p className="text-gray-400 text-sm">Espaço da barra lateral (30%)</p>
                </div>
            </section>

        </>
    )
}