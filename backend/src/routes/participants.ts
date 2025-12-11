/**
 * Participant Routes
 */

import { Router } from 'express';
import { ParticipantModel, SessionModel } from '../models';
import { CreateParticipantInput } from '@evr/shared';
import { createError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/sessions/:sessionId/join
 * Join a session as a participant
 */
router.post('/:sessionId/join', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { username, role } = req.body;

    // Verify session exists
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw createError('Session not found', 404);
    }

    // Check if session is accepting participants
    if (session.status === 'ended') {
      throw createError('Session has ended', 400);
    }

    // Get current participant count
    const participants = await ParticipantModel.findBySession(sessionId, true);
    if (participants.length >= session.config.maxParticipants) {
      throw createError('Session is full', 400);
    }

    const input: CreateParticipantInput = {
      sessionId,
      username,
      role: role || 'voter',
    };

    const participant = await ParticipantModel.create(input);
    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/participants/:id
 * Get participant by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.findById(id);

    if (!participant) {
      throw createError('Participant not found', 404);
    }

    res.json(participant);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:sessionId/participants
 * Get all participants in a session
 */
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const activeOnly = req.query.activeOnly === 'true';

    const participants = await ParticipantModel.findBySession(sessionId, activeOnly);
    res.json(participants);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/participants/:id
 * Update participant
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.update(id, req.body);

    if (!participant) {
      throw createError('Participant not found', 404);
    }

    res.json(participant);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/participants/:id/score
 * Update participant score
 */
router.post('/:id/score', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newScore, round, reason } = req.body;

    if (newScore === undefined || !round || !reason) {
      throw createError('newScore, round, and reason are required', 400);
    }

    const participant = await ParticipantModel.updateScore(id, newScore, round, reason);

    if (!participant) {
      throw createError('Participant not found', 404);
    }

    res.json(participant);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/participants/:id
 * Remove participant (set inactive)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const participant = await ParticipantModel.update(id, { isActive: false });

    if (!participant) {
      throw createError('Participant not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
