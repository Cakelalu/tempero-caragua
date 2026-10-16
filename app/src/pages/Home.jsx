import FeaturedPosts from "../components/FeaturedPosts";

export default function Home() {
    return(
        <main className="">
            <div className="h-screen w-screen flex flex-col items-center justify-center">
                <h1>Bem-vindo ao Tempero Caraguá!</h1>
                <p>Um projeto que oferece um ambiente seguro, inclusivo e diverso para os moradores caraguatatubenses,<br /> para que possam acessar e compartilhar saberes sobre a gastronomia caiçara da cidade, por meio do registro,<br /> preservação e difusão digital de receitas tradicionais de famílias de Caraguatatuba.</p>

                <FeaturedPosts posts={[]} />
            </div>
        </main>
    )
}