import { cert } from "firebase-admin/app";

const firebaseAdminConfig = {
    credential: cert({
        projectId: "csclub-website",
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
}

export default firebaseAdminConfig;