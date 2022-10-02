import { initializeApp, getApps } from "firebase-admin/app";
import { auth } from "firebase-admin";
import firebaseAdminConfig from "util/firebase/admin/config";

if (getApps().length === 0) {
    try {
        initializeApp(firebaseAdminConfig);
    } catch (error: any) {
        console.error("Firebase initialization error: ", error.stack);
    }
}

export default auth();