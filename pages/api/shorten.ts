import type { NextApiRequest, NextApiResponse } from 'next'
import adminFirestore from 'util/firebase/admin/db';

interface ExpectedRequestData {
    short: string;
}

interface ResponseData {
    success: boolean,
    url?: string
}

// ! NOTE: ONLY MEANT TO BE USED BY MIDDLEWARE
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    const shortened = req.body.short.replace("/shrt/", "").replace(/\//g, "");

    // Stop if it's empty
    if (!shortened) {
        res.json({
            success: false
        });
        return;
    }

    // Get reference to doc in Firebase
    const shortURLRef = adminFirestore.doc(`/shortener/${shortened}`);
    const shortURLDocSnap = await shortURLRef.get();

    // Return 404 if document doesn't exists
    if (!shortURLDocSnap.exists) {
        res.json({
            success: false
        });
        return;
    }

    // Get URL to redirect to
    const longURL = shortURLDocSnap.data()!.url as string;

    // Send to user
    res.json({
        success: true,
        url: longURL
    });
}