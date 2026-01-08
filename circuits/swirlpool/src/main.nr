use dep::poseidon::poseidon::bn254;

// Poseidon hash of two fields
fn hash2(left: Field, right: Field) -> Field {
    bn254::hash_2([left, right])
}

fn main(
    // -------- Private inputs --------
    secret: Field,
    nullifier: Field,
    merkle_path: [Field; 20],
    merkle_indices: [u8; 20],

    // -------- Public inputs --------
    root: pub Field,
    nullifier_hash: pub Field,
) {
    // 1. Compute commitment
    let commitment = hash2(secret, nullifier);

    // 2. Recompute Merkle root
    let mut current_hash = commitment;

    for i in 0..20 {
        let sibling = merkle_path[i];
        let index = merkle_indices[i];

        // index == 0 => current is left
        // index == 1 => current is right
        current_hash = if index == 0 {
            hash2(current_hash, sibling)
        } else {
            hash2(sibling, current_hash)
        };
    }

    // 3. Root must match public root
    assert(current_hash == root);

    // 4. Compute nullifier hash
    let computed_nullifier_hash = hash2(nullifier, 0);

    assert(computed_nullifier_hash == nullifier_hash);
}
