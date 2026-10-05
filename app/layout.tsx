import type {Metadata} from "next"; import "./globals.css";
export const metadata:Metadata={title:"ALIS | Legal early-warning and preparation",description:"Understand legal exposure before ordinary situations become legal problems."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
