import { useEffect, useState } from "react";
import FeaturedPosts from "../components/FeaturedPosts";

const API_BASE_URL = (import.meta.env.VITE_PUBLIC_API_URL || "http://localhost:4500").replace(/\/$/, "");

export default function Posts() {
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
                if (!Array.isArray(data.posts)) {
                    throw new Error("A resposta da API não contém uma lista de postagens.");
                }

                setPosts(data.posts);
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
        console.log("Posts:", posts);

        loadPosts();
        return () => controller.abort();
    }, []);

    return (
        <main className="w-full">
            {error ? (
                <p className="px-4 py-8 text-center text-red-700" role="alert">
                    {error}
                </p>
            ) : isLoading ? (
                <p className="px-4 py-8 text-center text-pallete-dark-green-2" role="status">
                    Carregando postagens...
                </p>
            ) : (
                <FeaturedPosts posts={posts} />
            )}
        </main>
    );
}
