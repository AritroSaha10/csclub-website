import adminAuth from 'util/firebase/admin/auth';
import type { NextApiRequest, NextApiResponse } from 'next'
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import adminFirestore from 'util/firebase/admin/db';

import { uuidv4 } from '@firebase/util';
import { Timestamp } from 'firebase-admin/firestore';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ success: false, code: -1 });
        return;
    }

    // Get user object from UID
    try {
        await adminAuth.getUser(req.body.uid);
    } catch (error: any) {
        if (["auth/user-not-found", "auth/invalid-uid"].includes(error.errorInfo.code)) {
            res.status(401).json({ success: false, code: 22 });
        } else {
            console.error("Error when fetching user info:", error);
            res.status(500).json({ success: false, code: -1 });
        }

        return;
    }

    // Check whether user is an admin by looking for admin doc ref
    const adminDocRef = adminFirestore.doc(`/admindata/${req.body.uid}`);
    const adminDocSnap = await adminDocRef.get();

    if (!adminDocSnap.exists) {
        // User is not an admin, don't allow them to do anything
        res.status(403).end();
        return;
    }

    // Get unix timestamp (milliseconds) from body
    const attnDateRaw = req.body.attn_date as number;

    // Make sure they provide a valid number
    if (attnDateRaw == NaN) {
        res.status(400).end();
        return;
    }

    // Convert timestamp into date object
    const attnDate = new Date(attnDateRaw);

    // Proposed date must be after current date
    if (Date.now() > attnDate.getTime()) {
        res.status(400).end();
        return;
    }
    
    // Create reference to new attn doc ref
    let newAttnDocRef = adminFirestore.doc(`attendance/${uuidv4().substring(0, 6)}`);

    // Ensure that it's not a duplicate by regenerating until it doesn't exist
    while ((await newAttnDocRef.get()).exists) {
        newAttnDocRef = adminFirestore.doc(`attendance/${uuidv4().substring(0, 6)}`);
    }

    // Create the attn document
    await newAttnDocRef.create({
        "date": Timestamp.fromDate(attnDate),
        "present": 0,
        "late": 0,
        "excused": 0
    });

    // Send response to user
    res.status(201).end();
}
