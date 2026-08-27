import { NavLink, useNavigate } from "react-router-dom"
import { Button, Checkbox, Label, TextInput } from "flowbite-react";
import { colors } from "flowbite-react/plugin/tailwindcss/colors";

export default function Register() {
    const navigate = useNavigate()

    function handleSubmit(event) {
        event.preventDefault()
        navigate('/login')
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
                <img src="./logo.svg" alt="Tempero Caraguá" />
                <h1 className='text-2xl'>Crie sua conta!</h1>

                <form className="flex max-w-md flex-col gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email2" className='text-white'>
                                Seu e-mail
                            </Label>
                        </div>
                        <TextInput id="email" type="email" placeholder="" required shadow theme={customInputTheme}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password2" className='text-white'>
                                Sua senha
                            </Label>
                        </div>
                        <TextInput id="password" type="password" required shadow theme={customInputTheme}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="repeat-password" className='text-white'>
                                Repita sua senha
                            </Label>
                        </div>
                        <TextInput id="repeat-password" type="password" required shadow theme={customInputTheme}/>
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