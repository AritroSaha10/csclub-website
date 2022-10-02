import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import firebaseConfig from "./config";

if (getApps().length === 0) {
    try {
        initializeApp(firebaseConfig);
    } catch (error: any) {
        console.error("Firebase initialization error: ", error.stack);
    }
}

export default getAuth();