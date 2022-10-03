import TitleHead from 'components/TitleHead'
import Link from 'next/link'
import type { NextPage } from 'next'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/router'

const buttonColoring =
    'bg-cyan-700 text-white hover:bg-white hover:text-cyan-700 active:bg-cyan-500 active:text-white transition-all duration-300'

const AttendanceIndex: NextPage = () => {
    const attnCodeInputRef = useRef<HTMLInputElement>(null);
    const [invalidAttnCode, setInvalidAttnCode] = useState<boolean>(false);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Check if string empty
        const attnCode = attnCodeInputRef.current?.value.trim().replace(/\//g, "");

        console.log(attnCode)

        if (!attnCode) {
            setInvalidAttnCode(true)
            return;
        }

        router.push(`/attn/${attnCode}`);
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[80vh]" key="attendance-index">
            <TitleHead name="Home" />

            <h1 className="text-4xl text-center mb-2 font-semibold text-white">
                Attendance Tracker
            </h1>

            <p className="text-xl text-center mb-4 text-gray-300 lg:w-1/3">
                Do you have an attendance code? Enter it here to sign in. You can also scan the QR code in class.
            </p>

            <div>
                <form className="flex flex-col sm:flex-row items-center gap-2 mt-4" onSubmit={handleSubmit} noValidate>
                    <input
                        className={`rounded-lg py-2 px-3 w-60 sm:w-72 align-middle text-black outline-none focus:ring-2 focus:ring-blue-700 duration-200 bg-white/40 shadow-lg focus:shadow-none ${invalidAttnCode && "ring-1 ring-red-600"}`}
                        placeholder="Attendance code"
                        name="attnCode"
                        onChange={() => setInvalidAttnCode(false)}
                        required
                        ref={attnCodeInputRef}
                    />
                    <button
                        type="submit"
                        className={`flex items-center rounded-lg py-2 px-4 w-60 sm:w-auto text-md ${buttonColoring} hover:bg-cyan-600 hover:text-white hover:cursor-pointer disabled:bg-cyan-900`}
                    >
                        Go
                    </button>
                </form>

                {invalidAttnCode && (
                    <p className="text-sm text-red-700 ml-1 mt-1">
                        Please provide a valid attendance code.
                    </p>
                )}
            </div>
        </div>
    )
}

export default AttendanceIndex
