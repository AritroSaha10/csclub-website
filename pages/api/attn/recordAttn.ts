import adminAuth from 'util/firebase/admin/auth';
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { firestore } from 'firebase-admin';
import adminFirestore from 'util/firebase/admin/db';
import { Timestamp } from "firebase-admin/firestore"

/**
 * All codes:
 * 10 -> Successful.
 * 15 -> Successful, but IP does not match school whitelist
 * 20 -> User cannot sign in more than 1 hour before/after meeting.
 * 22 -> UID is invalid.
 * 24 -> User is not a JFSS student.
 * 26 -> User has already checked in. 
 * 30 -> Invalid attendance ID.
 */
type ResponseData = {
    success: boolean,
    code: number
}

const schoolIPs = [
    "::1"
]

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, code: -1 });
        return;
    }

    const clientIp = ((req.headers['x-forwarded-for'] || '') as string).split(',').pop()?.trim() || req.socket.remoteAddress || "";

    // Check if IP matches school
    const isGoodIP = schoolIPs.indexOf(clientIp) != -1;

    // Get user object from UID
    let userInfo: UserRecord;
    try {
        userInfo = await adminAuth.getUser(req.body.uid);
    } catch (error: any) {
        if (["auth/user-not-found", "auth/invalid-uid"].includes(error.errorInfo.code)) {
            res.status(401).json({ success: false, code: 22 });
        } else {
            console.error("Error when fetching user info:", error);
            res.status(500).json({ success: false, code: -1 });
        }

        return;
    }

    // User is fully authenticated! Fetch student #
    const studentNumber = userInfo.email?.replace("@pdsb.net", "");

    // Check if user is JFSS student
    if (!userInfo.displayName?.includes("John Fraser SS")) {
        console.warn(`User ${studentNumber} is not a John Fraser SS student. Not allowing check-in...`);
        res.status(403).json({ success: false, code: 24 });
        return;
    }

    // Check if they are signing in at the right time (not >1h before/after meeting time)
    // Get time of meeting that user is signing in for
    const attnId = (req.body.attn_id as string || "").replace(/\//g, "");
    const attnFullDocRef = adminFirestore.doc(`attendance/${attnId}`);
    const attnFullDocSnap = await attnFullDocRef.get();

    // Attendance doc does not exist, let user know
    if (!attnFullDocSnap.exists) {
        res.status(404).json({ success: false, code: 30 });
        return;
    }

    // Get time of meeting from doc
    const meetingTime = new Date(attnFullDocSnap.data()?.date.seconds * 1000);
    const timeDelta = Math.abs(Date.now() - meetingTime.getTime()) / 1000;

    // Check whether delta is larger than an hour
    if (timeDelta >= 60 * 60) {
        console.warn(`User ${studentNumber} attempted to sign-in after ${timeDelta} seconds. Ignoring...`);
        res.status(403).json({ success: false, code: 20 });
        return;
    }

    // Create reference to document that would contain user's attendance info
    const userAttnDocRef = adminFirestore.doc(`attendance/${attnId}/entries/${userInfo.uid}`);

    // If already exists, user already signed in.
    if ((await userAttnDocRef.get()).exists) {
        res.status(400).json({ success: false, code: 26 });
        return;
    }

    // Create attn record
    await userAttnDocRef.create({
        "ip_addr": clientIp,
        "is_good_ip": isGoodIP,
        "student_number": studentNumber,
        "time": Timestamp.now()
    })

    // Increment late/present counters
    if (timeDelta >= 15 * 60) {
        // Consider >=15min late as late
        await attnFullDocRef.update({
            "late": (attnFullDocSnap.data()?.late || 0) + 1
        })
    } else {
        // Otherwise, present
        await attnFullDocRef.update({
            "present": (attnFullDocSnap.data()?.present || 0) + 1
        })
    }

    // TODO: Integration with Google Sheets

    // Everything went successfully! Send user success code
    if (isGoodIP) {
        res.status(200).json({ success: true, code: 10 });
    } else {
        res.status(200).json({ success: true, code: 15 });
    }
}
