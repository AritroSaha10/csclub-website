import { collection, getDoc, doc, getDocs } from 'firebase/firestore'
import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import auth from 'util/firebase/auth'
import db from 'util/firebase/db'

import axios, { AxiosError } from "axios"

import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, setPersistence, browserLocalPersistence, getRedirectResult, signOut } from "firebase/auth";
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AttendanceAdmin() {
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [user, setUser] = useState<{ [key: string]: any }>({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [allAttnDocs, setAllAttnDocs] = useState<any[]>([]);

    const signIn = () => {
        // Prompt user to log in
        setPersistence(auth, browserLocalPersistence).then(async () => {
            const authProvider = new GoogleAuthProvider();

            authProvider.setCustomParameters({
                "login_hint": "123456@pdsb.net",
                "hd": "pdsb.net" // Only allow users part of pdsb.net organization
            })

            return signInWithRedirect(auth, authProvider)
        })
    }

    useEffect(() => {
        onAuthStateChanged(auth, async (newUser) => {
            if (newUser && Object.keys(newUser).length !== 0) {
                // Set user data
                setUser(newUser);

                // If they can access this doc, they're an admin
                try {
                    await getDoc(doc(db, "admindata", "test"))
                    setIsAdmin(true);

                    // Get all attn entries
                    const allAttnSnap = await getDocs(collection(db, "attendance"));
                    let tmpAttnDocs: any[] = [];
                    allAttnSnap.forEach((documentData) => {
                        tmpAttnDocs.push({ ...documentData.data(), id: documentData.id });
                    })

                    // Sort from most latest to least
                    tmpAttnDocs.sort((a, b) => b.date.seconds - a.date.seconds)

                    setAllAttnDocs(tmpAttnDocs);
                } catch (e) {
                    setIsAdmin(false);
                }
            } else {
                setUser({})
            }

            setLoadingAuth(false)
        })
    }, [])

    if (loadingAuth) {
        return (
            <div className="flex flex-col flex-grow justify-center" key="attendance-admin-index-loading">
                <div className="flex flex-col p-8 items-center">
                    <h2 className="text-5xl font-semibold text-center mb-6 text-black dark:text-white">
                        Loading...
                    </h2>
                </div>
            </div>
        )
    }

    if (user && Object.keys(user).length !== 0) {
        if (isAdmin) {
            if (allAttnDocs.length) {
                return (
                    <div className='flex flex-col flex-grow p-12' key="attendance-admin-index">
                        <h1 className='text-3xl font-semibold text-white text-center mb-6'>Attendance Tracker</h1>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            {allAttnDocs.map((data) => {
                                const meetingDate = new Date(data.date.seconds * 1000);
                                const dateString = meetingDate.toLocaleDateString("en-US", {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })

                                return (
                                    <Link href={`/attn/admin/${data.id}`} key={data.date.seconds}>
                                        <a>
                                            <div className="flex flex-col bg-gray-700 p-4 text-center rounded-md">
                                                <h2 className='text-2xl font-medium text-white mb-2'>{dateString}</h2>
                                                <p className='text-lg text-gray-300'>Present: {data.present}</p>
                                                <p className='text-lg text-gray-300 mb-4'>Late: {data.late}</p>
                                                <p className='text-lg text-gray-300 mb-4'>Late: {data.excused || 0}</p>

                                                <p className='text-sm text-gray-300'>Click on me for more info...</p>
                                            </div>
                                        </a>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="flex flex-col flex-grow justify-center" key="attendance-admin-index-loading">
                        <div className="flex flex-col p-8 items-center">
                            <h2 className="text-5xl font-semibold text-center mb-6 text-black dark:text-white">
                                Loading...
                            </h2>
                        </div>
                    </div>
                )
            }
        } else {
            return (
                <div className="flex flex-col flex-grow justify-center" key="attendance-admin-index-403">
                    <div className="flex flex-col p-8 items-center">
                        <h2 className="text-5xl font-semibold text-center mb-6 text-black dark:text-white">
                            403 Forbidden
                        </h2>

                        <p className="text-2xl text-center mb-6 text-gray-700 dark:text-gray-300 lg:w-1/2">
                            Only administrators are allowed to access this page. Contact Aritro if you&apos;re supposed to have access to this but don&apos;t.
                        </p>

                        <button
                            onClick={() => signOut(auth)}
                            className="py-2 px-5 bg-red-600 hover:bg-red-800 duration-150 text-xl font-medium text-white rounded-lg"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )
        }
    } else {
        return (
            <div className="flex flex-col flex-grow justify-center" key="attendance-admin-index-401">
                <div className="flex flex-col p-8 items-center">
                    <h2 className="text-5xl font-semibold text-center mb-6 text-black dark:text-white">
                        401 Unauthorized
                    </h2>

                    <p className="text-2xl text-center mb-6 text-gray-700 dark:text-gray-300 lg:w-1/2">
                        You must sign in with a PDSB account to access this page.
                    </p>

                    <button
                        onClick={() => signIn()}
                        className="py-2 px-5 bg-blue-600 hover:bg-blue-800 duration-150 text-xl font-medium text-white rounded-lg"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        )
    }
}