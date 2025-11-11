import { Router } from 'express';
import { VotingService } from '../services/VotingService';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { rateLimitVote } from '../middleware/rateLimit.middleware';

const router = Router();
const votingService = new VotingService();

/**
 * Check eligibility to vote
 */
router.get(
  '/eligibility/:electionId',
  authenticate,
  async (req, res) => {
    try {
      const { electionId } = req.params;
      const userId = req.user!.userId;

      const eligibility = await votingService.checkEligibility(userId, electionId);

      res.json(eligibility);
    } catch (error: any) {
      console.error('Check eligibility error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Cast a vote
 */
router.post(
  '/cast',
  authenticate,
  rateLimitVote,
  async (req, res) => {
    try {
      const { electionId, voteOptionId, encryptedVote, signature } = req.body;
      const userId = req.user!.userId;

      if (!electionId || !voteOptionId || !encryptedVote || !signature) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await votingService.castVote(
        userId,
        electionId,
        voteOptionId,
        encryptedVote,
        signature
      );

      res.json(result);
    } catch (error: any) {
      console.error('Cast vote error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * Verify a receipt
 */
router.post(
  '/verify-receipt',
  async (req, res) => {
    try {
      const { receipt } = req.body;

      if (!receipt) {
        return res.status(400).json({ error: 'Receipt is required' });
      }

      const result = await votingService.verifyReceipt(receipt);

      res.json(result);
    } catch (error: any) {
      console.error('Verify receipt error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get voting statistics (admin only)
 */
router.get(
  '/statistics/:electionId',
  authenticate,
  requireRole(['admin', 'auditor']),
  async (req, res) => {
    try {
      const { electionId } = req.params;

      const statistics = await votingService.getVotingStatistics(electionId);

      res.json(statistics);
    } catch (error: any) {
      console.error('Get statistics error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Verify election integrity
 */
router.get(
  '/integrity/:electionId',
  async (req, res) => {
    try {
      const { electionId } = req.params;

      const result = await votingService.verifyElectionIntegrity(electionId);

      res.json(result);
    } catch (error: any) {
      console.error('Verify integrity error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Decrypt votes (admin only, after election ends)
 */
router.post(
  '/decrypt/:electionId',
  authenticate,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { electionId } = req.params;
      const { keyShares } = req.body;

      if (!keyShares || !Array.isArray(keyShares)) {
        return res.status(400).json({ error: 'Valid key shares are required' });
      }

      const results = await votingService.decryptVotes(electionId, keyShares);

      res.json({ results });
    } catch (error: any) {
      console.error('Decrypt votes error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;

