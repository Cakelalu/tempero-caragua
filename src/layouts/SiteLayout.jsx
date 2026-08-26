import { Outlet } from 'react-router'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function SiteLayout() {
    return (
        <div className="flex flex-col min-h-screen overflow-x-hidden w-full"> {/* className="max-w-3xl mx-auto py-8"> */}
            <Header />
            <div className='self-center px-6 py-3'>
                <Outlet />
            </div>
            <div className='relative bottom-0 mt-auto'>
                <Footer />
            </div>
        </div>
    )
}