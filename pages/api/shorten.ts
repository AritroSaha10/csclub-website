import type { NextApiRequest, NextApiResponse } from 'next'
import adminFirestore from 'util/firebase/admin/db';

type ResponseData = {
    success: boolean,
    url?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    console.log()
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