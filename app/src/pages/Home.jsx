import { useEffect, useState } from "react";
import FeaturedPosts from "../components/FeaturedPosts";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function loadPosts() {
            try {
                const response = await fetch(`${API_BASE_URL}/posts`, {
                    method: 'GET',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error("Não foi possível carregar as postagens.");
                }

                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error("A resposta da API não contém uma lista de postagens.");
                }

                setPosts(data);
            } catch (loadError) {
                if (loadError.name !== "AbortError") {
                    setError(loadError.message || "Erro ao carregar as postagens.");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadPosts();
        return () => controller.abort();
    }, []);

    if (error) {
        return (
            <main className="">
                <div className="h-screen w-screen flex flex-col items-center justify-center">
                    <h1>Bem-vindo ao Tempero Caraguá!</h1>
                    <p className="text-red-500">{error}</p>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="">
                <div className="h-screen w-screen flex flex-col items-center justify-center">
                    <h1>Bem-vindo ao Tempero Caraguá!</h1>
                    <p>Carregando postagens...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="">
            <div className="h-screen w-screen flex flex-col items-center justify-center">
                <h1>Bem-vindo ao Tempero Caraguá!</h1>
                <p>Um projeto que oferece um ambiente seguro, inclusivo e diverso para os moradores caraguatatubenses,<br /> para que possam acessar e compartilhar saberes sobre a gastronomia caiçara da cidade, por meio do registro,<br /> preservação e difusão digital de receitas tradicionais de famílias de Caraguatatuba.</p>

                <FeaturedPosts posts={posts} />
            </div>
        </main>
    );
}
