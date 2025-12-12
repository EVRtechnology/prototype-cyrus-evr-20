/**
 * Support Stake Model
 * Handles database operations for support stakes
 */

import pool from '../config/database';
import { SupportStake, CreateSupportStakeInput, ResolveSupportStakeInput } from '@evr/shared';

export class SupportStakeModel {
  /**
   * Create a new support stake
   */
  static async create(input: CreateSupportStakeInput): Promise<SupportStake> {
    const query = `
      INSERT INTO support_stakes (session_id, suggestion_id, supporter_id, supporter_score_at_stake)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [input.sessionId, input.suggestionId, input.supporterId, input.supporterScoreAtStake];
    const result = await pool.query(query, values);
    return this.mapRowToSupportStake(result.rows[0]);
  }

  /**
   * Find support stake by ID
   */
  static async findById(id: string): Promise<SupportStake | null> {
    const query = 'SELECT * FROM support_stakes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToSupportStake(result.rows[0]) : null;
  }

  /**
   * Find support stake by supporter and suggestion
   */
  static async findBySupporterAndSuggestion(
    supporterId: string,
    suggestionId: string
  ): Promise<SupportStake | null> {
    const query = 'SELECT * FROM support_stakes WHERE supporter_id = $1 AND suggestion_id = $2';
    const result = await pool.query(query, [supporterId, suggestionId]);
    return result.rows[0] ? this.mapRowToSupportStake(result.rows[0]) : null;
  }

  /**
   * Find all support stakes for a suggestion
   */
  static async findBySuggestion(suggestionId: string): Promise<SupportStake[]> {
    const query = `
      SELECT * FROM support_stakes
      WHERE suggestion_id = $1
      ORDER BY staked_at ASC
    `;

    const result = await pool.query(query, [suggestionId]);
    return result.rows.map(this.mapRowToSupportStake);
  }

  /**
   * Find all support stakes by a supporter
   */
  static async findBySupporter(supporterId: string): Promise<SupportStake[]> {
    const query = `
      SELECT * FROM support_stakes
      WHERE supporter_id = $1
      ORDER BY staked_at DESC
    `;

    const result = await pool.query(query, [supporterId]);
    return result.rows.map(this.mapRowToSupportStake);
  }

  /**
   * Find all unresolved stakes for a supporter
   */
  static async findUnresolvedBySupporter(supporterId: string): Promise<SupportStake[]> {
    const query = `
      SELECT * FROM support_stakes
      WHERE supporter_id = $1 AND resolved = false
      ORDER BY staked_at ASC
    `;

    const result = await pool.query(query, [supporterId]);
    return result.rows.map(this.mapRowToSupportStake);
  }

  /**
   * Find all support stakes in a session
   */
  static async findBySession(sessionId: string): Promise<SupportStake[]> {
    const query = `
      SELECT * FROM support_stakes
      WHERE session_id = $1
      ORDER BY staked_at ASC
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows.map(this.mapRowToSupportStake);
  }

  /**
   * Resolve a support stake
   */
  static async resolve(id: string, input: ResolveSupportStakeInput): Promise<SupportStake | null> {
    const query = `
      UPDATE support_stakes
      SET resolved = true, outcome = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [input.outcome, id]);
    return result.rows[0] ? this.mapRowToSupportStake(result.rows[0]) : null;
  }

  /**
   * Resolve all stakes for a suggestion
   */
  static async resolveBySuggestion(
    suggestionId: string,
    outcome: 'success' | 'failure'
  ): Promise<SupportStake[]> {
    const query = `
      UPDATE support_stakes
      SET resolved = true, outcome = $1
      WHERE suggestion_id = $2 AND resolved = false
      RETURNING *
    `;

    const result = await pool.query(query, [outcome, suggestionId]);
    return result.rows.map(this.mapRowToSupportStake);
  }

  /**
   * Delete a support stake
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM support_stakes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Map database row to SupportStake object
   */
  private static mapRowToSupportStake(row: any): SupportStake {
    return {
      id: row.id,
      sessionId: row.session_id,
      suggestionId: row.suggestion_id,
      supporterId: row.supporter_id,
      supporterScoreAtStake: parseFloat(row.supporter_score_at_stake),
      stakedAt: new Date(row.staked_at),
      resolved: row.resolved,
      outcome: row.outcome || undefined,
    };
  }
}
