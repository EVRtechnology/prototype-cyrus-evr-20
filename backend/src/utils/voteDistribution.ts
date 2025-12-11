/**
 * Vote Distribution Utilities
 * Implements exponential vote distribution (3^round)
 */

/**
 * Calculate required votes per suggestion for a given round
 * Round 1: 3, Round 2: 9, Round 3: 27, etc.
 */
export function getVotesPerSuggestion(round: number): number {
  return Math.pow(3, round);
}

/**
 * Calculate total votes needed for a round
 * totalSuggestions * votesPerSuggestion
 */
export function getTotalVotesForRound(round: number, totalSuggestions: number): number {
  return totalSuggestions * getVotesPerSuggestion(round);
}

/**
 * Distribute suggestions to voters fairly
 * Uses Fisher-Yates shuffle for randomization with round-based seed
 */
export function distributeSuggestionsToVoters(
  suggestionIds: string[],
  voterIds: string[],
  round: number
): Map<string, string[]> {
  const votesPerSuggestion = getVotesPerSuggestion(round);
  const distribution = new Map<string, string[]>();

  // Initialize distribution map
  voterIds.forEach(voterId => {
    distribution.set(voterId, []);
  });

  // If we don't have enough voters, handle edge case
  if (voterIds.length === 0) {
    return distribution;
  }

  // For each suggestion, assign the required number of voters
  suggestionIds.forEach(suggestionId => {
    // Create a shuffled copy of voters for this suggestion
    const shuffledVoters = [...voterIds];
    shuffleArray(shuffledVoters);

    // Assign voters to this suggestion
    for (let i = 0; i < votesPerSuggestion && i < shuffledVoters.length; i++) {
      const voterId = shuffledVoters[i];
      const voterSuggestions = distribution.get(voterId) || [];
      voterSuggestions.push(suggestionId);
      distribution.set(voterId, voterSuggestions);
    }
  });

  return distribution;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Check if a suggestion has passed based on votes
 * Simple majority: votesFor / totalVotes > 0.5
 */
export function hasSuggestionPassed(votesFor: number, totalVotes: number): boolean {
  if (totalVotes === 0) return false;
  return (votesFor / totalVotes) > 0.5;
}

/**
 * Calculate approval percentage
 */
export function getApprovalPercentage(votesFor: number, totalVotes: number): number {
  if (totalVotes === 0) return 0;
  return Math.round((votesFor / totalVotes) * 100);
}

/**
 * Check if we have enough voters for a round
 */
export function hasEnoughVoters(voterCount: number, suggestionCount: number, round: number): boolean {
  const requiredVotes = getTotalVotesForRound(round, suggestionCount);
  // Each voter should ideally handle a reasonable number of votes
  const maxVotesPerVoter = 10; // Configurable threshold
  return voterCount * maxVotesPerVoter >= requiredVotes;
}
