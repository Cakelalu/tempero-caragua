import { NavLink, useNavigate } from "react-router-dom"
import { useState } from 'react'
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { colors } from "flowbite-react/plugin/tailwindcss/colors";

export default function Register() {

    const [Nome, setNome] = useState("")
    const [Username, setUsername] = useState("")
    const [Email, setEmail] = useState("")
    const [Senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")
    const navigate = useNavigate()

    const handleRegister = async (e) => {
        e.preventDefault()

        if (Senha !== confirmarSenha) {
            console.log('As senhas devem ser iguais')
            return
        }

        const API_URL = import.meta.env.VITE_PUBLIC_API_URL || 'http://localhost:4000'

        try {
            const resposta = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: Nome,
                    nomeUsuario: Username,
                    email: Email,
                    senha: Senha
                })
            })
            
            const dados = await resposta.json()

            if (!resposta.ok) {
                throw new Error(dados.message || 'Erro ao criar usuário')
            }

            navigate('/')
            
        } catch (error) {
            console.error('Erro no registro:', error)
        }
    }

    const customInputTheme = {
        field: {
            input: {
                colors: 'bg-pallete-dark-green-2'
            }
        }
    }

    return (
        <>
            <section className="flex h-screen w-screen bg-pallete-dark-green-2 gap-5 flex-col items-center justify-center">
                <img src="/logo.svg" alt="Tempero Caraguá" />
                <h1 className='text-2xl'>Crie sua conta!</h1>

                <form className="flex max-w-md flex-col gap-4" onSubmit={handleRegister}>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="nome" className='text-white'>
                                Seu nome completo
                            </Label>
                        </div>
                        <TextInput id="nome" type="text" placeholder="" required value={Nome} onChange={(e) => setNome(e.target.value)} shadow />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="username" className='text-white'>
                                Seu nome de usuário
                            </Label>
                        </div>
                        <TextInput id="username" type="text" placeholder="" required value={Username} onChange={(e) => setUsername(e.target.value)} shadow  />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email2" className='text-white'>
                                Seu e-mail
                            </Label>
                        </div>
                        <TextInput id="email" type="email" placeholder="" value={Email} onChange={(e) => setEmail(e.target.value)} required shadow/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password2" className='text-white'>
                                Sua senha
                            </Label>
                        </div>
                        <TextInput id="password" type="password" required value={Senha} onChange={(e) => {setSenha(e.target.value)}} shadow />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="repeat-password" className='text-white'>
                                Repita sua senha
                            </Label>
                        </div>
                        <TextInput id="repeat-password" type="password" required value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} shadow/>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="agree" />
                        <Label htmlFor="agree" className="flex text-white">
                            Eu concordo com os&nbsp;
                            <NavLink href="#" className="text-white hover:underline dark:text-cyan-500">
                                termos e condições
                            </NavLink>
                        </Label>
                    </div>
                    <Button type="submit" className='bg-pallete-orange hover:bg-pallete-dark-orange transition-colors duration-150'>Registrar nova conta</Button>
                </form>

                <p className="text-center">
                    Já possui uma conta?<br />
                    <NavLink to="/login" className='text-pallete-light-orange hover:underline'>Faça o login</NavLink>
                </p>
            </section>
        </>
    )
}