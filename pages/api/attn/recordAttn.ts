import type { NextApiRequest, NextApiResponse } from 'next'

import adminAuth from 'util/firebase/admin/auth';
import adminFirestore from 'util/firebase/admin/db';

import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { Timestamp } from "firebase-admin/firestore"

interface ExpectedRequestData {
    excused_absence: boolean, 
    uid: string, // Firebase Auth UID of user
    attn_id: string // ID of attendance record
}

/**
 * All codes:
 * 10 -> Successful, marked as present.
 * 11 -> Successful, marked as present, but IP does not match school whitelist.
 * 15 -> Successful, marked as late.
 * 16 -> Successful, marked as late, but IP does not match school whitelist.
 * 18 -> Successful, marked as excused absence.
 * 
 * 20 -> User cannot sign in more than 1 hour before/after start of meeting.
 * 21 -> User cannot file an excused absence 1 hour after meeting.
 * 22 -> UID is invalid.
 * 24 -> User is not a JFSS student.
 * 26 -> User has already checked in. 
 * 
 * 30 -> Invalid attendance ID.
 */
interface ResponseData {
    success: boolean,
    code: number
}

const schoolIPs = [
    "::1",
    "205.167.54.",
    "67.21.152.",
    "67.21.153.",
    "67.21.154.",
    "67.21.155."
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

    // Get user's IP
    const clientIp = ((req.headers['x-forwarded-for'] || '') as string).split(',').pop()?.trim() || req.socket.remoteAddress || "";

    // Check if IP matches school
    const isGoodIP = schoolIPs.filter(a => clientIp.includes(a)).length === 1

    // Store whether this is an excused absence entry 
    const isExcusedAbsence = !!req.body.excused_absence;

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
    const timeDeltaNoAbs = (Date.now() - meetingTime.getTime()) / 1000;

    // Check whether delta is larger than an hour
    // Only stop them if they're not filing an excused absence
    if (timeDelta >= 60 * 60 && !isExcusedAbsence) {
        console.warn(`User ${studentNumber} attempted to sign-in after ${timeDelta} seconds. Ignoring...`);
        res.status(403).json({ success: false, code: 20 });
        return;
    } 
    // Don't allow people to file excused absence before one hour of meeting
    else if (timeDeltaNoAbs >= -60 * 60 && isExcusedAbsence) {
        console.warn(`User ${studentNumber} attempted to file excused absence after ${timeDelta} seconds of start of meeting. Ignoring...`);
        res.status(403).json({ success: false, code: 21 });
        return;
    }

    // Create reference to document that would contain user's attendance info
    const userAttnDocRef = adminFirestore.doc(`attendance/${attnId}/entries/${userInfo.uid}`);

    // If already exists, user already signed in.
    if ((await userAttnDocRef.get()).exists) {
        console.warn(`User ${studentNumber} already signed in before. Ignoring...`);
        res.status(418).json({ success: false, code: 26 });
        return;
    }
    
    // Determine whether user is late or not
    const isLate = timeDeltaNoAbs >= 15 * 60;

    // Create attn record
    await userAttnDocRef.create({
        "ip_addr": clientIp,
        "user_info": {
            "photo_url": userInfo.photoURL,
            "display_name": userInfo.displayName,
        },
        "is_good_ip": isGoodIP,
        "student_number": studentNumber,
        "time": Timestamp.now(),
        "late": isLate,
        "excused_absence": isExcusedAbsence
    })

    // Increment absent/late/present counters
    if (isExcusedAbsence) {
        // Put under excused absence
        await attnFullDocRef.update({
            "excused": (attnFullDocSnap.data()?.excused || 0) + 1
        });

        // Send response to user
        res.status(200).json({ success: true, code: 18 + Number(!isGoodIP) });
    } else if (isLate) {
        // Consider >=15min late as late
        await attnFullDocRef.update({
            "late": (attnFullDocSnap.data()?.late || 0) + 1
        });

        // Send response to user
        res.status(200).json({ success: true, code: 15 + Number(!isGoodIP) });
    } else {
        // Otherwise, present
        await attnFullDocRef.update({
            "present": (attnFullDocSnap.data()?.present || 0) + 1
        });

        // Send response to user
        res.status(200).json({ success: true, code: 10 + Number(!isGoodIP) });
    }

    // TODO: Integration with Google Sheets???
}
