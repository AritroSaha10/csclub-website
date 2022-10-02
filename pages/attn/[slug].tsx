import { collection, getDoc, doc } from 'firebase/firestore'
import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import auth from 'util/firebase/auth'
import adminFirestore from 'util/firebase/admin/db';

import axios, { AxiosError } from "axios"

import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, setPersistence, browserLocalPersistence, getRedirectResult, signOut } from "firebase/auth";
import { useEffect, useState } from 'react'

interface PageProps {
    timestamp: number,
    signInAllowed: boolean,
    attnId: string
}

const resCodeMapping = {
    20: {
        "title": "403 Forbidden",
        "content": "You are not allowed to sign in more than one hour earlier / later from a meeting time. If you are early, please try again later."
    },
    22: {
        "title": "401 Unauthorized",
        "content": "You are unauthorized. Try signing out and signing in."
    },
    24: {
        "title": "403 Forbidden",
        "content": "You must be from John Fraser SS in order to sign in."
    },
    26: {
        "title": "418 I'm a Teapot",
        "content": "You've already checked in for today."
    },
    30: {
        "title": "404 Not Found",
        "content": "The attendance ID does not exist in our systems."
    },
    [-1]: {
        "title": "500 Server Error",
        "content": "Something went wrong on our side, sorry about that. We'll get this fixed ASAP. In the meanwhile, try refreshing later."
    }
}

const AttendancePage: NextPage<PageProps> = ({ timestamp, signInAllowed, attnId }) => {
    const attnDate = new Date(timestamp);
    const [loadingAuth, setLoadingAuth] = useState(true)
    const [user, setUser] = useState<{[key: string]: any}>({});
    const [serverRes, setServerRes] = useState<{[key: string]: any}>({});

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

    const sendAttnRecReq = async () => {
        try {
            // Send request to server
            const res = await axios.post("/api/attn/recordAttn", {
                "uid": user.uid,
                "attn_id": attnId
            });

            // Get response and status code, update state
            setServerRes({
                "data": res.data,
                "statusCode": res.status
            })
        } catch (error: any) {
            // Get the response and status code if it errors out
            setServerRes({
                "data": error.response.data,
                "statusCode": error.response.status
            })
        }
    }

    useEffect(() => {
        onAuthStateChanged(auth, (newUser) => {
            if (newUser && Object.keys(newUser).length !== 0) {
                // Set user data
                setUser(newUser);
            } else {
                setUser({})
            }

            setLoadingAuth(false)
        })
    }, [])

    // If it's too late to sign in, let them know
    /*
    if (!signInAllowed) {
        return (
            <div>
                <h1>403 Forbidden</h1>
                <p>You are not allowed to sign in more than one hour earlier / later from a meeting time. If you are early, please try again later.</p>
            </div>
        )
    }
    */

    if (user.displayName && !user.displayName.includes("John Fraser SS")) {
        return (
            <div>
                <h1>403 Forbidden</h1>
                <p>You must be from John Fraser SS in order to sign in.</p>
                <button onClick={() => signOut(auth)}>Sign out</button>
            </div>
        )
    }

    if (loadingAuth) {
        return <>Loading...</>
    } else {        
        if (user && Object.keys(user).length !== 0) {
            if (Object.keys(serverRes).length === 0) {
                return (
                    <div>
                        <p>Signed in as {user.email}</p>
                        <button onClick={() => sendAttnRecReq()}>Confirm Attendance</button>
                        <button onClick={() => signOut(auth)}>Sign out</button>
                    </div>
                )
            } else {
                if (serverRes.statusCode === 200) {
                    const dateString = attnDate.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    })

                    const latePresentText = (serverRes.data?.code === 10 || serverRes.data?.code === 11) ? "present" : "late";
                    return (
                        <div>
                            <h1>200 OK</h1>
                            <p>You&apos;ve been marked as <b>{latePresentText}</b> for the meeting on {dateString}.</p>
                        </div>
                    )
                } else {
                    // Server intentionally sent error
                    const x = (serverRes.data?.code || -1) as (20 | 22 | 24 | 26 | -1)
                    const resCodeData = resCodeMapping[x];

                    return (
                        <div>
                            <h1>{resCodeData.title}</h1>
                            <p>{resCodeData.content}</p>
                            <button onClick={() => signOut(auth)}>Sign out</button>
                        </div>
                    )
                }
            }
        } else {
            return (
                <div>
                    <h1>401 Unauthorized</h1>
                    <p>You must sign in with a PDSB account to access this page.</p>
                    <button onClick={() => signIn()}>Sign in</button>
                </div>
            )
        }
    }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
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

    // Get date object from date dov
    const attnDate = new Date(attnFullDocSnap.data()?.date.seconds * 1000);

    // Only allow sign ins 1 hour before and after actual date
    const currentDate = Date.now()
    const timeDelta = Math.abs(currentDate - attnDate.getTime()) / 1000

    let signInAllowed = timeDelta <= 60 * 60;

    return {
        props: {
            timestamp: attnDate.getTime(),
            signInAllowed,
            attnId: slug
        }
    }
}

export default AttendancePage;
