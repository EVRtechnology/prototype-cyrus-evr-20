/**
 * Session Routes
 */

import { Router } from 'express';
import { SessionModel } from '../models';
import { CreateSessionInput, UpdateSessionInput } from '@evr/shared';
import { createError } from '../middleware/errorHandler';

const router = Router();

/**
 * POST /api/sessions
 * Create a new session
 */
router.post('/', async (req, res, next) => {
  try {
    const input: CreateSessionInput = {
      name: req.body.name,
      facilitatorId: req.body.facilitatorId,
      config: req.body.config,
    };

    if (!input.name || !input.facilitatorId) {
      throw createError('Name and facilitatorId are required', 400);
    }

    const session = await SessionModel.create(input);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:code
 * Get session by code
 */
router.get('/:code', async (req, res, next) => {
  try {
    const { code } = req.params;
    const session = await SessionModel.findByCode(code);

    if (!session) {
      throw createError('Session not found', 404);
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/id/:id
 * Get session by ID
 */
router.get('/id/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await SessionModel.findById(id);

    if (!session) {
      throw createError('Session not found', 404);
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/sessions/:id
 * Update session
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const input: UpdateSessionInput = req.body;

    const session = await SessionModel.update(id, input);

    if (!session) {
      throw createError('Session not found', 404);
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions/:id/start
 * Start a session
 */
router.post('/:id/start', async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await SessionModel.start(id);

    if (!session) {
      throw createError('Session not found', 404);
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sessions/:id/end
 * End a session
 */
router.post('/:id/end', async (req, res, next) => {
  try {
    const { id } = req.params;
    const session = await SessionModel.end(id);

    if (!session) {
      throw createError('Session not found', 404);
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await SessionModel.delete(id);

    if (!deleted) {
      throw createError('Session not found', 404);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
