import Image from 'next/image'
import Link from 'next/link'
import { m } from "framer-motion"
import React, { useEffect, useRef, useState } from 'react'

import VideoPoster from "../../public/images/hero-csclub.png"

const transition = { duration: 1.4, ease: [0.6, 0.01, -0.05, 0.9] };

const lineVariants = {
    initial: {
    },
    animate: {
        transition: {
            staggerChildren: 0.2,
        }
    }
};

const subtitleVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { ...transition, duration: 1.2, delay: 0.5 }, }
};

const characterVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { ...transition, duration: 1.2 }, }
};

const bottomLine = "Fraser CS  Club".split('  ');

export default function Hero() {
    return (
        <div className="flex flex-col h-[92vh] relative w-full">
            <div className='overflow-hidden' style={{ boxShadow: "inset 0 0 200px #000000" }}>
                <Image
                    src={VideoPoster}
                    placeholder="blur"
                    objectFit="cover"
                    objectPosition="center"
                    alt="Hero image"
                    layout="fill"
                    quality={100}
                    priority={true}
                />
            </div>

            <div className='w-full h-[92vh] absolute bg-black/60 mix-blend-normal' />

            <div className="absolute p-4 xs:p-8 sm:p-16 z-1 flex flex-col justify-center items-center h-[92vh] w-full">
                <div className="text-center">
                    <div className="mb-4">
                        <m.div variants={lineVariants} initial="initial" animate="animate" className="font-bold flex flex-col flex-wrap gap-2 text-6xl sm:text-7xl lg:text-9xl">
                            {bottomLine.map(char => <m.span className="inline-block relative bg-clip-text text-transparent bg-gradient-to-r from-[#00539C] to-[#8EB8E5] pb-5" variants={characterVariants} key={char}>{char}</m.span>)}
                        </m.div>
                    </div>
                </div>

                <m.div variants={subtitleVariants} initial="initial" animate="animate" className="flex flex-col gap-2 text-white text-3xl font-light text-center mb-6 md:w-3/4 lg:w-1/3">
                    Learn about Computer Science every Tuesday from 3-4 PM.
                </m.div>

                {/* <Link href="/sign-up">
                    <a className="py-4 px-6 bg-violet-500 rounded-lg font-semibold text-white hover:bg-violet-700 duration-150 text-lg lg:text-2xl mt-4">
                        Sign Up Today!
                    </a>
                </Link> */}

                <Link href="/attn">
                    <a
                        className="py-4 px-6 bg-blue-500 rounded-lg font-semibold text-white hover:bg-blue-700 duration-150 text-lg lg:text-2xl mt-4"
                    >
                        Attendance Tracker
                    </a>
                </Link>
            </div>
        </div>
    )
}