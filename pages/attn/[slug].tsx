import { collection, getDoc, doc } from 'firebase/firestore'
import type { NextPage, GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import auth from 'util/firebase/auth'
import db from 'util/firebase/db'

import axios from "axios"

import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, setPersistence, browserLocalPersistence, getRedirectResult, signOut } from "firebase/auth";
import { useEffect, useState } from 'react'

interface PageProps {
    timestamp: number,
    signInAllowed: boolean
}

const AttendancePage: NextPage<PageProps> = ({ timestamp, signInAllowed }) => {
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

    const sendAttnRecReq = () => {
        
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
                <p>You are not allowed to sign in more than two hours earlier / later from a meeting time. If you are early, please try again later.</p>
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
            if (!Object.keys(serverRes).length !== 0) {
                return (
                    <div>
                        <p>Signed in as {user.email}</p>
                        <button onClick={() => sendAttnRecReq()}>Confirm Attendance</button>
                        <button onClick={() => signOut(auth)}>Sign out</button>
                    </div>
                )
            } else {
                return (
                    <div>
                        
                    </div>
                )
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

    // Get date mapping document
    const datesDocRef = doc(db, "info", "dates");
    const datesData: { [key: string]: any } = (await getDoc(datesDocRef)).data()!;
    const dateStrMapping = datesData.mapping;

    // Map string to date
    if (!(slug in dateStrMapping)) {
        return {
            notFound: true
        }
    }

    // Only allow sign ins 1 hour before and after actual date
    const currentDate = Date.now() / 1000
    const timeDelta = Math.abs(currentDate - dateStrMapping[slug].seconds)

    let signInAllowed = timeDelta <= 60 * 60;

    return {
        props: {
            timestamp: dateStrMapping[slug].seconds * 1000,
            signInAllowed
        }
    }
}

export default AttendancePage;
