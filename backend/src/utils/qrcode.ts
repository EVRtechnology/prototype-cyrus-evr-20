/**
 * QR Code Generation and Validation Utilities
 *
 * SECURITY NOTICE:
 * This module handles QR code generation and validation with cryptographic
 * signatures to prevent tampering and ensure data integrity.
 *
 * Key security features:
 * - HMAC-SHA256 signatures for data integrity
 * - Zod schema validation for input data
 * - Expiry timestamp validation
 * - Protection against injection attacks via strict parsing
 *
 * @see config for QR_HMAC_SECRET configuration
 */

import QRCode from 'qrcode';
import crypto from 'crypto';
import { z } from 'zod';
import config from '../config';
import { QRCodeData } from '@evr/shared';

/**
 * Zod schema for validating QR code data structure
 *
 * SECURITY: This schema provides strict validation to prevent:
 * - Type confusion attacks
 * - Missing required fields
 * - Invalid data types
 * - Malformed timestamps
 * - Score manipulation
 */
const QRCodeDataSchema = z.object({
  participantId: z.string()
    .uuid({ message: 'participantId must be a valid UUID' }),

  sessionId: z.string()
    .uuid({ message: 'sessionId must be a valid UUID' }),

  billingsScore: z.number()
    .min(0, { message: 'billingsScore must be between 0 and 1' })
    .max(1, { message: 'billingsScore must be between 0 and 1' }),

  expiresAt: z.string()
    .datetime({ message: 'expiresAt must be a valid ISO 8601 datetime' }),

  signature: z.string()
    .min(64, { message: 'signature must be a valid HMAC-SHA256 hash (64 hex chars)' })
    .max(64, { message: 'signature must be a valid HMAC-SHA256 hash (64 hex chars)' })
    .regex(/^[a-f0-9]+$/, { message: 'signature must contain only hexadecimal characters' }),
}).strict(); // Reject any additional properties

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
 * Zod schema for validating input parameters to createQRCodeData
 *
 * SECURITY: Validates inputs before creating QR codes to ensure:
 * - Valid UUID format for IDs
 * - Score is within valid range [0, 1]
 */
const CreateQRCodeInputSchema = z.object({
  participantId: z.string().uuid({ message: 'participantId must be a valid UUID' }),
  sessionId: z.string().uuid({ message: 'sessionId must be a valid UUID' }),
  billingsScore: z.number()
    .min(0, { message: 'billingsScore must be between 0 and 1' })
    .max(1, { message: 'billingsScore must be between 0 and 1' }),
});

/**
 * Create QR code data object with signature
 *
 * SECURITY: Validates inputs and generates HMAC signature for data integrity.
 * The signature prevents tampering with QR code data.
 *
 * @param participantId - UUID of the participant
 * @param sessionId - UUID of the session
 * @param billingsScore - Current Billings score (0-1)
 * @returns QRCodeData object with HMAC signature
 * @throws {Error} If input validation fails
 *
 * @example
 * ```typescript
 * const qrData = createQRCodeData(
 *   '550e8400-e29b-41d4-a716-446655440000',
 *   '550e8400-e29b-41d4-a716-446655440001',
 *   0.75
 * );
 * ```
 */
export function createQRCodeData(
  participantId: string,
  sessionId: string,
  billingsScore: number
): QRCodeData {
  // SECURITY: Validate inputs before processing
  const validationResult = CreateQRCodeInputSchema.safeParse({
    participantId,
    sessionId,
    billingsScore,
  });

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    throw new Error(`Invalid input for QR code creation: ${errors}`);
  }

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
 *
 * SECURITY: Uses Zod schema validation to ensure data integrity and prevent:
 * - JSON injection attacks
 * - Type confusion
 * - Missing or malformed fields
 * - Invalid UUIDs or scores
 * - Malicious additional properties
 *
 * @param dataString - JSON string from scanned QR code
 * @returns Validated QRCodeData object or null if invalid
 *
 * @example
 * ```typescript
 * const qrData = parseQRCodeData(scannedString);
 * if (qrData) {
 *   const validation = validateQRCodeData(qrData);
 *   if (validation.valid) {
 *     // QR code is valid and not expired
 *   }
 * }
 * ```
 */
export function parseQRCodeData(dataString: string): QRCodeData | null {
  try {
    // SECURITY: Limit input size to prevent DoS attacks
    if (dataString.length > 10000) {
      console.error('QR code data exceeds maximum length (10KB)');
      return null;
    }

    // Parse JSON (may throw)
    const parsedData = JSON.parse(dataString);

    // SECURITY: Validate with Zod schema for strict type checking
    const validationResult = QRCodeDataSchema.safeParse(parsedData);

    if (!validationResult.success) {
      console.error('QR code data validation failed:', validationResult.error.format());
      return null;
    }

    return validationResult.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('QR code data is not valid JSON');
    } else {
      console.error('Error parsing QR code data:', error);
    }
    return null;
  }
}

/**
 * Check if QR code is still valid (not expired)
 */
export function isQRCodeExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
