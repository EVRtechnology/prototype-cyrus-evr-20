/**
 * Session Model
 * Handles database operations for sessions
 */

import pool from '../config/database';
import { Session, CreateSessionInput, UpdateSessionInput, SessionConfig } from '@evr/shared';
import { generateSessionCode } from '../utils/sessionCode';
import config from '../config';

export class SessionModel {
  /**
   * Create a new session
   */
  static async create(input: CreateSessionInput): Promise<Session> {
    const code = generateSessionCode();
    const sessionConfig: SessionConfig = {
      ...config.sessionDefaults,
      ...input.config,
    };

    const query = `
      INSERT INTO sessions (code, name, facilitator_id, config)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [code, input.name, input.facilitatorId, JSON.stringify(sessionConfig)];
    const result = await pool.query(query, values);
    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Find session by ID
   */
  static async findById(id: string): Promise<Session | null> {
    const query = 'SELECT * FROM sessions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSession(result.rows[0]) : null;
  }

  /**
   * Find session by code
   */
  static async findByCode(code: string): Promise<Session | null> {
    const query = 'SELECT * FROM sessions WHERE code = $1';
    const result = await pool.query(query, [code]);
    return result.rows[0] ? this.mapRowToSession(result.rows[0]) : null;
  }

  /**
   * Update session
   */
  static async update(id: string, input: UpdateSessionInput): Promise<Session | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(input.name);
    }

    if (input.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (input.currentRound !== undefined) {
      fields.push(`current_round = $${paramCount++}`);
      values.push(input.currentRound);
    }

    if (input.config !== undefined) {
      // Merge with existing config
      const existing = await this.findById(id);
      if (!existing) return null;

      const mergedConfig = {
        ...existing.config,
        ...input.config,
      };

      fields.push(`config = $${paramCount++}`);
      values.push(JSON.stringify(mergedConfig));
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE sessions
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] ? this.mapRowToSession(result.rows[0]) : null;
  }

  /**
   * Start a session
   */
  static async start(id: string): Promise<Session | null> {
    const query = `
      UPDATE sessions
      SET status = 'lobby', started_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSession(result.rows[0]) : null;
  }

  /**
   * End a session
   */
  static async end(id: string): Promise<Session | null> {
    const query = `
      UPDATE sessions
      SET status = 'ended', ended_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSession(result.rows[0]) : null;
  }

  /**
   * Get all sessions for a facilitator
   */
  static async findByFacilitator(facilitatorId: string): Promise<Session[]> {
    const query = `
      SELECT * FROM sessions
      WHERE facilitator_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [facilitatorId]);
    return result.rows.map(this.mapRowToSession);
  }

  /**
   * Delete a session
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM sessions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to Session object
   */
  private static mapRowToSession(row: any): Session {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      facilitatorId: row.facilitator_id,
      status: row.status,
      config: typeof row.config === 'string' ? JSON.parse(row.config) : row.config,
      currentRound: row.current_round,
      createdAt: new Date(row.created_at),
      startedAt: row.started_at ? new Date(row.started_at) : undefined,
      endedAt: row.ended_at ? new Date(row.ended_at) : undefined,
    };
  }
}
