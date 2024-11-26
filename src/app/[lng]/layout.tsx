import "@/styles/globals.scss";
import { ReactNode } from "react";
import { dir } from "i18next";
import { languages } from "@/data/constants";
import { PropsProvider } from "@/data/propsContext";

type RootLayoutProps = { children: ReactNode; params: Promise<{ lng: string }> };
export async function generateStaticParams() {
    return languages.map((lng) => ({ lng }));
}

export default async function RootLayout({
    children,
    params,
}: RootLayoutProps) {
    const { lng } = await params;
    return (
        <html lang={lng} dir={dir(lng)}>
            <head />
            <body>
                <PropsProvider value={lng}>
                    {children}
                </PropsProvider>
            </body>
        </html>
    );
}