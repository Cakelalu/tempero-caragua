import FeaturedPosts from "../components/FeaturedPosts";

export default function Home() {
    return(
        <main className="">
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-primary text-pallete-dark-green-2">
                <h1>Bem-vindo à nossa página inicial!</h1>
                <p>Esta é a descrição da nossa página inicial.</p>

                <FeaturedPosts posts={[]} />
            </div>
        </main>
    )
}