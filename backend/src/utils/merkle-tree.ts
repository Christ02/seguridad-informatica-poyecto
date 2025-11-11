import crypto from 'crypto';

/**
 * Merkle Tree implementation for blockchain
 */
export class MerkleTree {
  private leaves: string[];
  private layers: string[][];

  constructor(leaves: string[]) {
    this.leaves = leaves.map((leaf) => this.hash(leaf));
    this.layers = this.buildTree(this.leaves);
  }

  /**
   * Hash function
   */
  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Build Merkle tree
   */
  private buildTree(leaves: string[]): string[][] {
    if (leaves.length === 0) {
      return [['0'.repeat(64)]]; // Empty tree root
    }

    const layers: string[][] = [leaves];
    
    while (layers[layers.length - 1].length > 1) {
      const currentLayer = layers[layers.length - 1];
      const nextLayer: string[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          // Pair exists
          const combined = [currentLayer[i], currentLayer[i + 1]].sort().join('');
          nextLayer.push(this.hash(combined));
        } else {
          // Odd node, promote to next layer
          nextLayer.push(currentLayer[i]);
        }
      }

      layers.push(nextLayer);
    }

    return layers;
  }

  /**
   * Get root hash
   */
  getRoot(): string {
    if (this.layers.length === 0) {
      return '0'.repeat(64);
    }
    return this.layers[this.layers.length - 1][0];
  }

  /**
   * Get proof for a leaf
   */
  getProof(leaf: string): string[] {
    const leafHash = this.hash(leaf);
    let index = this.layers[0].indexOf(leafHash);

    if (index === -1) {
      throw new Error('Leaf not found in tree');
    }

    const proof: string[] = [];

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRightNode = index % 2 === 1;
      const siblingIndex = isRightNode ? index - 1 : index + 1;

      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * Verify proof
   */
  verifyProof(leaf: string, proof: string[], root: string): boolean {
    let hash = this.hash(leaf);

    for (const proofElement of proof) {
      // Combine hashes in sorted order
      const combined = [hash, proofElement].sort().join('');
      hash = this.hash(combined);
    }

    return hash === root;
  }

  /**
   * Get all layers (for visualization)
   */
  getLayers(): string[][] {
    return this.layers;
  }

  /**
   * Get tree depth
   */
  getDepth(): number {
    return this.layers.length;
  }

  /**
   * Get leaf count
   */
  getLeafCount(): number {
    return this.leaves.length;
  }
}

