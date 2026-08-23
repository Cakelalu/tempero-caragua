import { NavLink, useNavigate } from "react-router"

export default function Register() {
    const navigate = useNavigate()

    function handleSubmit(event) {
        event.preventDefault()
        navigate('/login')
    }

    return (
        <>
            <section className="grid min-h-screen">
                <h1>Cadastrar</h1><br />

                <form onSubmit={handleSubmit} className="bg-pallete-dark-green-2 w-full flex flex-col items-center justify-center gap-3">
                    {/* nome */}
                    <div className="flex flex-col">
                        <label htmlFor="name">Nome</label>
                        <input type="text" id="name" name="name"
                        className="bg-blue-400 rounded
                        shadow-purple-300"/>
                    </div>
                    
                
                    {/* email */}
                    <div className="flex flex-col">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" id="email" name="email"
                        className="bg-blue-400 rounded
                        shadow-purple-300"/>
                    </div>
                
                    {/* senha */}
                    <div className="flex flex-col">
                        <label htmlFor="password">Senha</label>
                        <input type="password" id="password"    name="password"
                        className="bg-blue-400 rounded
                        shadow-purple-300"/>
                    </div>

                    {/* confirmar senha */}
                    <div className="flex flex-col">
                        <label htmlFor="confirm">Confirmar senha</label>
                        <input type="password" id="confirm"     name="confirm"
                        className="bg-blue-400 rounded
                        shadow-purple-300"/>
                    </div>
                    <br />

                    {/* demais campos: e-mail, senha e confirmar senha */}
                    <button type="submit">Cadastrar</button>
                </form><br />

                <p>
                    Já possui uma conta?<br/>
                    <NavLink to="/login">Faça o login</NavLink>
                </p>
            </section>
        </>
    )
}