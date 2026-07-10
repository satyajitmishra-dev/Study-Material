'use server';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

// Cloudinary transformation presets per field type
const TRANSFORM_PRESETS: Record<string, string> = {
  coverImage: 'w_1200,h_675,c_fill,ar_16:9,q_auto,f_auto',
  thumbnail: 'w_400,c_fill,ar_1:1,q_auto,f_auto',
};

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // Check Cloudinary config
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary is not configured. Please paste a URL instead, or ask your admin to set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.' },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const field = (formData.get('field') as string) || 'coverImage';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type "${file.type}". Allowed: JPEG, PNG, WebP, GIF, SVG.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { success: false, error: `File too large (${sizeMB} MB). Maximum allowed size is 10 MB.` },
        { status: 400 }
      );
    }

    // Build Cloudinary upload request
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'study-materials';

    // Generate signature using Web Crypto API (Edge-compatible, no Node crypto needed)
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Upload to Cloudinary via REST API
    const uploadForm = new FormData();
    uploadForm.append('file', file);
    uploadForm.append('api_key', apiKey);
    uploadForm.append('timestamp', timestamp.toString());
    uploadForm.append('signature', signature);
    uploadForm.append('folder', folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: uploadForm }
    );

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      console.error('Cloudinary upload failed:', errBody);
      return NextResponse.json(
        { success: false, error: 'Upload to Cloudinary failed. Please try again.' },
        { status: 502 }
      );
    }

    const uploadData = await uploadRes.json();
    const publicId = uploadData.public_id;
    const format = uploadData.format;

    // Build optimized delivery URL with transformations
    const transform = TRANSFORM_PRESETS[field] || TRANSFORM_PRESETS.coverImage;
    const optimizedUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transform}/${publicId}.${format}`;

    // Also provide the raw URL for flexibility
    const rawUrl = uploadData.secure_url;

    return NextResponse.json({
      success: true,
      url: optimizedUrl,
      rawUrl,
      publicId,
      width: uploadData.width,
      height: uploadData.height,
      size: uploadData.bytes,
      format: uploadData.format,
    });
  } catch (err: any) {
    console.error('Upload API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
