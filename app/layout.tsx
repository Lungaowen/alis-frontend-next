import "./globals.css";
import type { Metadata } from "next";
export const metadata:Metadata={title:"ALIS | Legal Intelligence",description:"Legal early-warning and preparation platform."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
