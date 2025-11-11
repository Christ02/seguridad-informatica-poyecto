import { Router } from 'express';
import { ElectionService } from '../services/ElectionService';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();
const electionService = new ElectionService();

/**
 * Create a new election (admin only, requires multi-sig)
 */
router.post(
  '/',
  authenticate,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const creatorId = req.user!.userId;
      const result = await electionService.createElection(req.body, creatorId);

      res.json(result);
    } catch (error: any) {
      console.error('Create election error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * Approve election creation (trustee only)
 */
router.post(
  '/approve/:transactionId',
  authenticate,
  requireRole(['trustee', 'admin']),
  async (req, res) => {
    try {
      const { transactionId } = req.params;
      const { signature } = req.body;
      const approverId = req.user!.userId;

      const result = await electionService.approveElectionCreation(
        transactionId,
        approverId,
        signature
      );

      res.json(result);
    } catch (error: any) {
      console.error('Approve election error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * Start an election (admin only, requires multi-sig)
 */
router.post(
  '/:electionId/start',
  authenticate,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { electionId } = req.params;
      const initiatorId = req.user!.userId;

      const result = await electionService.startElection(electionId, initiatorId);

      res.json(result);
    } catch (error: any) {
      console.error('Start election error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * End an election (admin only, requires multi-sig)
 */
router.post(
  '/:electionId/end',
  authenticate,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { electionId } = req.params;
      const initiatorId = req.user!.userId;

      const result = await electionService.endElection(electionId, initiatorId);

      res.json(result);
    } catch (error: any) {
      console.error('End election error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * Get all elections
 */
router.get(
  '/',
  async (req, res) => {
    try {
      const { status, startDate, endDate } = req.query;

      const elections = await electionService.getAllElections({
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.json(elections);
    } catch (error: any) {
      console.error('Get elections error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get election by ID
 */
router.get(
  '/:electionId',
  async (req, res) => {
    try {
      const { electionId } = req.params;

      const election = await electionService.getElection(electionId);

      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      res.json(election);
    } catch (error: any) {
      console.error('Get election error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get candidates for election
 */
router.get(
  '/:electionId/candidates',
  async (req, res) => {
    try {
      const { electionId } = req.params;

      const candidates = await electionService.getCandidates(electionId);

      res.json(candidates);
    } catch (error: any) {
      console.error('Get candidates error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get vote options for election
 */
router.get(
  '/:electionId/vote-options',
  async (req, res) => {
    try {
      const { electionId } = req.params;

      const voteOptions = await electionService.getVoteOptions(electionId);

      res.json(voteOptions);
    } catch (error: any) {
      console.error('Get vote options error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get pending multi-sig transactions
 */
router.get(
  '/transactions/pending',
  authenticate,
  requireRole(['trustee', 'admin']),
  async (req, res) => {
    try {
      const userId = req.user!.userId;

      const transactions = await electionService.getPendingTransactions(userId);

      res.json(transactions);
    } catch (error: any) {
      console.error('Get pending transactions error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get transaction by ID
 */
router.get(
  '/transactions/:transactionId',
  authenticate,
  requireRole(['trustee', 'admin']),
  async (req, res) => {
    try {
      const { transactionId } = req.params;

      const transaction = await electionService.getTransaction(transactionId);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error: any) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * Get election results
 */
router.get(
  '/:electionId/results',
  authenticate,
  async (req, res) => {
    try {
      const { electionId } = req.params;

      const results = await electionService.getResults(electionId);

      res.json(results);
    } catch (error: any) {
      console.error('Get results error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;

