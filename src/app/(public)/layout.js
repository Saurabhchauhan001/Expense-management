import '../globals.css'
import PublicNavbar from '../../components/NavbarPublic';
import { Metadata } from 'next'

export const metadata = {
  title: 'Welcome to Our Public Site',
  description: 'Explore our public pages and discover more about our services.',
  keywords: 'public, landing, intro, services, company',
  author: 'Your Company Name',
}

export default function PublicLayout({ children }) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
    </>
  )
}