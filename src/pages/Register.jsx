import { NavLink, useNavigate } from "react-router"
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
            <section className="grid h-screen w-screen bg-pallete-dark-green-2  flex-col items-center justify-center">
                <h1>Crie sua conta!</h1>

                <form className="flex max-w-md flex-col gap-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="email2">Seu e-mail</Label>
                        </div>
                        <TextInput id="email" type="email" placeholder="" required shadow theme={customInputTheme}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="password2">Sua senha</Label>
                        </div>
                        <TextInput id="password" type="password" required shadow theme={customInputTheme}/>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="repeat-password">Repita sua senha</Label>
                        </div>
                        <TextInput id="repeat-password" type="password" required shadow theme={customInputTheme}/>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="agree" />
                        <Label htmlFor="agree" className="flex">
                            Eu concordo com os&nbsp;
                            <NavLink href="#" className="text-cyan-600 hover:underline dark:text-cyan-500">
                                termos e condições
                            </NavLink>
                        </Label>
                    </div>
                    <Button type="submit">Registrar nova conta</Button>
                </form>

                <p>
                    Já possui uma conta?<br />
                    <NavLink to="/login">Faça o login</NavLink>
                </p>
            </section>
        </>
    )
}