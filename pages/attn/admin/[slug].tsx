import { collection, getDoc, doc, getDocs } from 'firebase/firestore'
import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import auth from 'util/firebase/auth'
import db from 'util/firebase/db'
import adminFirestore from 'util/firebase/admin/db'

import axios, { AxiosError } from "axios"

import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, setPersistence, browserLocalPersistence, getRedirectResult, signOut } from "firebase/auth";
import { useEffect, useState } from 'react'
import Link from 'next/link'

import { IoMdArrowBack } from "react-icons/io"

export default function AttendanceAdmin({ attnId }: { attnId: string }) {
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [user, setUser] = useState<{ [key: string]: any }>({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [attnData, setAttnData] = useState<{ [key: string]: any }>({});

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
                    await getDoc(doc(db, "admindata", newUser.uid))
                    setIsAdmin(true);

                    // Get attendance data
                    const attnSnap = await getDoc(doc(db, "attendance", attnId));
                    const entriesSnap = await getDocs(collection(db, "attendance", attnId, "entries"));

                    // Convert collection snap to actual data
                    let entries: { [key: string]: any }[] = [];
                    entriesSnap.forEach(doc => {
                        entries.push({ ...doc.data(), id: doc.id })
                    });

                    entries.sort((a, b) => b.time.seconds - a.time.seconds)

                    const rawData = {
                        ...attnSnap.data()!,
                        entries: entries
                    };

                    setAttnData(rawData);
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
            <div className="flex flex-col flex-grow justify-center" key="attendance-admin-loading">
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
            if (attnData && Object.keys(attnData).length !== 0) {
                console.log(attnData)

                const meetingDate = new Date(attnData.date.seconds * 1000);
                const dateString = meetingDate.toLocaleDateString("en-US", {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                })

                return (
                    <div className='flex flex-col flex-grow p-12 items-center' key="attendance-admin-slug">
                        <Link href="/attn/admin">
                            <a className='flex gap-1 items-center text-blue-500 active:text-blue-700 hover:underline duration-150'>
                                <IoMdArrowBack /> Go Back
                            </a>
                        </Link>
                        <h1 className='text-3xl font-semibold text-white text-center mb-6'>Attendance for {dateString}</h1>

                        <h2 className='text-2xl text-gray-300 mb-3 text-center'>Present: {attnData.present}</h2>
                        <div className='flex flex-wrap items-center justify-center gap-4 mb-6'>
                            {attnData.entries.filter((data: any) => !data.late && !data.excused_absence).map((data: any) => {
                                const signInTime = new Date(data.time.seconds * 1000);
                                const timeString = signInTime.toLocaleTimeString("en-US", {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })

                                return (
                                    <div className='flex flex-col gap-3 items-center p-4 bg-gray-700 text-center rounded-md' key={data.student_number}>
                                        <div>
                                            <h3 className='text-xl font-medium text-white'>
                                                {data.student_number}
                                            </h3>

                                            {data.user_info && (
                                                <div className="flex flex-row gap-1 text-sm text-gray-300 items-center">
                                                    <Image src={data.user_info.photo_url} alt="pfp" height={25} width={25} className="rounded-full" quality={100} />
                                                    <span>{data.user_info.display_name.replace(" John Fraser SS", "").replace(data.student_number, "")}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-md text-gray-300">
                                                <span className={`font-semibold ${data.is_good_ip ? "text-gray-300" : "text-red-400"}`}>IP Address:</span> {data.ip_addr}
                                            </p>

                                            <p className="text-md text-gray-300">
                                                <span className='font-semibold'>Sign-in time:</span> {timeString}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <h2 className='text-2xl text-gray-300 mb-3 text-center'>Late: {attnData.late}</h2>
                        <div className='flex flex-wrap items-center justify-center gap-4 mb-6'>
                            {attnData.entries.filter((data: any) => data.late && !data.excused_absence).map((data: any) => {
                                const signInTime = new Date(data.time.seconds * 1000);
                                const timeString = signInTime.toLocaleTimeString("en-US", {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })

                                return (
                                    <div className='flex flex-col gap-3 items-center p-4 bg-gray-700 text-center rounded-md' key={data.student_number}>
                                        <div>
                                            <h3 className='text-xl font-medium text-white'>
                                                {data.student_number}
                                            </h3>

                                            {data.user_info && (
                                                <div className="flex flex-row gap-1 text-sm text-gray-300 items-center">
                                                    <Image src={data.user_info.photo_url} alt="pfp" height={25} width={25} className="rounded-full" quality={100} />
                                                    <span>{data.user_info.display_name.replace(" John Fraser SS", "").replace(data.student_number, "")}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-md text-gray-300">
                                                <span className={`font-semibold ${data.is_good_ip ? "text-gray-300" : "text-red-400"}`}>IP Address:</span> {data.ip_addr}
                                            </p>

                                            <p className="text-md text-gray-300">
                                                <span className='font-semibold'>Sign-in time:</span> {timeString}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <h2 className='text-2xl text-gray-300 mb-3 text-center'>Excused Absences: {attnData.excused || 0}</h2>
                        <div className='flex flex-wrap items-center justify-center gap-4 mb-6'>
                            {attnData.entries.filter((data: any) => data.excused_absence).map((data: any) => {
                                const signInTime = new Date(data.time.seconds * 1000);
                                const timeString = signInTime.toLocaleTimeString("en-US", {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                })

                                return (
                                    <div className='flex flex-col gap-3 items-center p-4 bg-gray-700 text-center rounded-md' key={data.student_number}>
                                        <div>
                                            <h3 className='text-xl font-medium text-white'>
                                                {data.student_number}
                                            </h3>

                                            {data.user_info && (
                                                <div className="flex flex-row gap-1 text-sm text-gray-300 items-center">
                                                    <Image src={data.user_info.photo_url} alt="pfp" height={25} width={25} className="rounded-full" quality={100} />
                                                    <span>{data.user_info.display_name.replace(" John Fraser SS", "").replace(data.student_number, "")}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="text-md text-gray-300">
                                                <span className="font-semibold text-gray-300">IP Address:</span> {data.ip_addr}
                                            </p>

                                            <p className="text-md text-gray-300">
                                                <span className='font-semibold'>Submission time:</span> {timeString}
                                            </p>

                                            {data.excused_reason && (
                                                <p className="text-md text-gray-300 break-words">
                                                    <span className='font-semibold'>Reason:</span> {data.excused_reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="flex flex-col flex-grow justify-center" key="attendance-admin-loading">
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
                <div className="flex flex-col flex-grow justify-center" key="attendance-admin-403">
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
            <div className="flex flex-col flex-grow justify-center" key="attendance-admin-403">
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

export const getServerSideProps: GetServerSideProps = async (context) => {
    // @ts-ignore I honestly don't know why this errors out, since I'm pretty sure it's normal syntax.
    const { slug = "" } = context.params;
    const attnId = slug.replace(/\//g, "");

    // Get reference to possible attendance doc
    const attnFullDocRef = adminFirestore.doc(`attendance/${attnId}`);
    const attnFullDocSnap = await attnFullDocRef.get();

    // Make sure it exists
    if (!attnFullDocSnap.exists) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            attnId
        }
    }
}