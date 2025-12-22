// circuits/private_pool/src/main.nr

// Tree depth must match Solidity
const TREE_DEPTH: usize = 20;

// Hash helpers
fn hash2(a: Field, b: Field) -> Field {
    pedersen([a, b])[0]
}

fn hash1(a: Field) -> Field {
    pedersen([a])[0]
}

fn compute_root(
    leaf: Field,
    path_elements: [Field; TREE_DEPTH],
    path_indices: [bool; TREE_DEPTH],
) -> Field {
    let mut hash = leaf;

    for i in 0..TREE_DEPTH {
        let sibling = path_elements[i];

        hash = if path_indices[i] {
            // right child
            hash2(sibling, hash)
        } else {
            // left child
            hash2(hash, sibling)
        };
    }

    hash
}

fn main(
    // ======== PUBLIC INPUTS ========
    root: pub Field,
    nullifier_hash: pub Field,

    // ======== PRIVATE INPUTS ========
    secret: Field,
    nullifier: Field,
    path_elements: [Field; TREE_DEPTH],
    path_indices: [bool; TREE_DEPTH],
) {
    // 1️⃣ Recompute commitment
    let commitment = hash2(secret, nullifier);

    // 2️⃣ Recompute Merkle root
    let computed_root =
        compute_root(commitment, path_elements, path_indices);

    // 3️⃣ Root must match on-chain root
    assert(computed_root == root);

    // 4️⃣ Bind nullifier to this commitment
    let computed_nullifier_hash = hash1(nullifier);
    assert(computed_nullifier_hash == nullifier_hash);
}
