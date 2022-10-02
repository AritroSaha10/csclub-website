/**
  * Name: Layout (animated)
  * Description: A reusable Layout to place in your _app.js for inter-page animations. 
  * Packages needed: None!
  * Example: https://ignitionhacks.org (powers page-to-page transitions)
*/

import Head from "next/head"

import Navbar from "./Navbar"
import Footer from "./Footer"

import { motion } from "framer-motion"
import { ReactElement, ReactNode } from "react";

const transition = { ease: [0.6, 0.01, -0.05, 0.9] };

const contentVariants = {
    initial: { y: 200, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -200, opacity: 0 },
    transition: { duration: 0.4, ...transition }
}

export default function Layout({ children, noAnim }: { children: ReactNode, noAnim?: boolean }) {
    const title = `JFSS CS Club`;
    const description = "John Fraser SS's one and only Computer Science Club.";
    const imageSrc = "https://frasercodes.vercel.app/images/csclub-logo.png"

    return (
        <div className="flex flex-col min-h-screen bg-[#101010] overflow-hidden">
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />

                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={imageSrc} />
                <meta property="og:image:type" content="image/png" />
                <meta property="og:image:width" content="1784" />
                <meta property="og:image:height" content="530" />

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:creator" content="@johnfrasercsclub" />
                <meta property="twitter:title" content={title} />
                <meta property="twitter:description" content={description} />
                <meta property="twitter:image:src" content={imageSrc} />
            </Head>

            <Navbar />

            <motion.div
                initial={noAnim ? {} : contentVariants.initial}
                animate={noAnim ? {} : contentVariants.animate}
                exit={noAnim ? {} : contentVariants.exit}
                transition={noAnim ? {} : contentVariants.transition}
                className="flex-grow flex flex-col"
            >
                {children}
            </motion.div>

            <Footer />
        </div>
    )
}