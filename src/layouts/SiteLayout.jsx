import { Outlet } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function SiteLayout() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
            <Header />
            <div className='self-center'>
                <Outlet />
            </div>
            <div className='relative bottom-0 mt-auto'>
                <Footer />
            </div>
        </div>
    )
}