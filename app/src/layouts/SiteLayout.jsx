import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { ThemeModeScript } from 'flowbite-react'

export default function SiteLayout() {
    return (
        <>
            <ThemeModeScript />
            <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
                <Header />
                <div className='w-full self-center'>
                    <Outlet />
                </div>
                <div className='relative bottom-0 mt-auto'>
                    <Footer />
                </div>
            </div>
        </>
    )
}