import React from "react"
import Image from 'next/image'
import { m } from "framer-motion"

import { fadeFromVariants, Direction } from "util/anim/fadeFrom"

import Logo from "public/images/random-coding-pic.jpg"
import Link from "next/link"

export default function About() {
    return (
        <section className="flex p-10 flex-col items-center lg:flex-row lg:p-20 xl:px-40 items-left bg-transparent gap-6" id="about">
            <m.div
                className="flex flex-col items-center lg:items-start w-4/5 text-center lg:text-left mb-4 lg:mb-0"
                variants={fadeFromVariants(Direction.BOTTOM, 1, 0, 30)}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <h1 className="text-white font-bold text-3xl md:text-4xl">Making computer science <span className='text-yellow-300'>approachable</span></h1>
                <p className="mt-4 w-full md:w-3/4 text-lg text-gray-200">
                    We&#39;re a student-run club at John Fraser Secondary School striving to make computer science approachable to students from all backgrounds. Running for over 4 years, we do weekly workshops on practical software development, and host a variety of events throughout the year.
                </p>

                <Link href="/archive">
                    <a 
                        className="group mt-4 bg-yellow-300 text-black font-semibold py-2 px-4 rounded-lg text-lg hover:bg-yellow-400 duration-75"
                    >
                        View our Archive <span className="group-hover:ml-1 duration-150 transition-all">→</span>
                    </a>
                </Link>
            </m.div>
            
            <m.div 
                className="flex p-0 m-0 w-1/2"
                variants={fadeFromVariants(Direction.BOTTOM, 1, 0, 30)}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <Image className="rounded-lg" src={Logo} alt="Image" objectFit="cover" objectPosition="center" width={900} height={540} quality={100} placeholder="blur" />
            </m.div>
        </section>
    )
}
