/**
 * QR Code Generation and Validation Utilities
 */

import QRCode from 'qrcode';
import crypto from 'crypto';
import config from '../config';
import { QRCodeData } from '@evr/shared';

/**
 * Generate HMAC signature for QR code data
 */
function generateSignature(data: string): string {
  return crypto
    .createHmac('sha256', config.qrHmacSecret)
    .update(data)
    .digest('hex');
}

/**
 * Create QR code data object with signature
 */
export function createQRCodeData(
  participantId: string,
  sessionId: string,
  billingsScore: number
): QRCodeData {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + config.qrCodeExpiryMinutes);

  const dataToSign = `${participantId}:${sessionId}:${billingsScore}:${expiresAt.toISOString()}`;
  const signature = generateSignature(dataToSign);

  return {
    participantId,
    sessionId,
    billingsScore,
    expiresAt: expiresAt.toISOString(),
    signature,
  };
}

/**
 * Validate QR code signature and expiry
 */
export function validateQRCodeData(qrData: QRCodeData): {
  valid: boolean;
  reason?: string;
} {
  // Check expiry
  const expiryDate = new Date(qrData.expiresAt);
  if (expiryDate < new Date()) {
    return { valid: false, reason: 'QR code has expired' };
  }

  // Verify signature
  const dataToVerify = `${qrData.participantId}:${qrData.sessionId}:${qrData.billingsScore}:${qrData.expiresAt}`;
  const expectedSignature = generateSignature(dataToVerify);

  if (qrData.signature !== expectedSignature) {
    return { valid: false, reason: 'Invalid QR code signature' };
  }

  return { valid: true };
}

/**
 * Generate QR code image as data URL
 */
export async function generateQRCodeImage(qrData: QRCodeData): Promise<string> {
  try {
    const dataString = JSON.stringify(qrData);
    const qrCodeDataUrl = await QRCode.toDataURL(dataString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Parse QR code data from scanned string
 */
export function parseQRCodeData(dataString: string): QRCodeData | null {
  try {
    const qrData = JSON.parse(dataString) as QRCodeData;

    // Validate required fields
    if (
      !qrData.participantId ||
      !qrData.sessionId ||
      typeof qrData.billingsScore !== 'number' ||
      !qrData.expiresAt ||
      !qrData.signature
    ) {
      return null;
    }

    return qrData;
  } catch (error) {
    console.error('Error parsing QR code data:', error);
    return null;
  }
}

/**
 * Check if QR code is still valid (not expired)
 */
export function isQRCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
