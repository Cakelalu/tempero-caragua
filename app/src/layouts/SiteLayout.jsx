import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { ThemeModeScript } from 'flowbite-react'

export default function SiteLayout() {
    return (
        <>
            <ThemeModeScript />
            <div className="flex flex-col min-h-screen overflow-x-hidden w-full bg-primary dark:bg-pallete-dark-gray">
                <Header />
                <main className="flex-1 min-h-0 w-full overflow-y-auto pt-20 pb-4">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </>
    );
}
