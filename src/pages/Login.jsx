import { NavLink } from "react-router"

export default function Login() {
    return (
        <>
            <section className="grid grid-cols-[70%_30%] h-screen w-screen overflow-hidden">
                <div className="bg-pallete-dark-green-2 w-full flex flex-col items-center justify-start gap-0 pt-8">
                    <img src="/logo.svg" alt="Logo" className="w-55 h-55" />
                    <p className="font-bold text-white">Acesse sua conta</p>

                    <form action="" className="flex flex-col gap-2 align-center justify-center w-2/4">
                        <label htmlFor="email" className="font-bold text-white">E-mail</label>
                        <input type="text" placeholder="E-mail" className="border border-white rounded p-2 font-bold text-white" />

                        <label htmlFor="password" className="font-bold text-white">Senha</label>
                        <input type="password" placeholder="Senha" className="border border-white rounded p-2 font-bold text-white" />

                        <button type="submit" className="bg-pallete-orange text-white rounded p-2 w-45 hover:underline mt-2 font-bold">
                            Entrar
                        </button>
                    </form>

                    <p className="font-bold">Ou</p>

                    <NavLink to="https://google.com/api/auth/login/google">
                        <div className="bg-pallete-gray rounded-sm px-3 py-1.5 text-black font-bold hover:underline w-45">
                            <p>Entrar com o Google</p>
                        </div>
                    </NavLink>

                    <p className="font-bold mt-3">Ainda não possui uma conta?</p>
                    <NavLink to="/cadastro" className="text-pallete-orange">Cadastrar-se</NavLink>

                </div>
                <div className="bg-white flex items-center justify-center">
                    <img src="/loginImg.svg" alt="Imagem de login" className="w-full h-full object-cover" />
                </div>
            </section>

        </>
    )
}