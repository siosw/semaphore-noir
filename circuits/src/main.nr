// use dep::std;

global LEVELS: Field = 2;

#[foreign(pedersen)]
fn pedersen<N>(_input : [Field; N]) -> [Field; 2] {}

#[builtin(to_le_bits)]
fn to_le_bits(_x : Field, _bit_size: u32) -> [u1] {}

// Returns the root of the tree from the provided leaf and its hashpath, using pedersen hash
fn compute_root_from_leaf(leaf : Field, index : Field, hash_path: [Field]) -> Field {
    // let n = hash_path.len();
    let n = LEVELS;
    let index_bits = to_le_bits(index, n as u32);
    let mut current = leaf;
    for i in 0..n {
        let path_bit = index_bits[i] as bool;
        let (hash_left, hash_right) = if path_bit {
            (hash_path[i], current)
         } else {
            (current, hash_path[i])
         };

      current = pedersen([hash_left, hash_right])[0];
    };
    current
}

fn main(
  id_nullifier: Field,
  id_trapdoor: Field,
  siblings: [Field; LEVELS],
  indices: Field,
  external_nullifier: Field,
  // ideally they should be return values but functionally this is the same
  root: pub Field,
  nullifier_hash: pub Field,
) {
  // reconstruct the commitment from the private nullfiers
  let secret = pedersen([id_nullifier, id_trapdoor]);
  let id_commitment = pedersen([secret[0]]);

  // compute the root of the merkle tree given the provided merkle merkle path
  // and the reconstructed id commitment
  // this can later be verified against a trusted root onchain or offchain
  constrain root == compute_root_from_leaf(id_commitment[0], indices, siblings); 

  // the nullifier hash allows us to check how often a given identity signaled per topic
  // every topic should use a distinct external nullifier
  constrain nullifier_hash == pedersen([external_nullifier, id_nullifier])[0];

  // [
  //   compute_root_from_leaf(id_commitment[0], indices, siblings), 
  //   pedersen([external_nullifier, id_nullifier])[0], 
  //   root, 
  //   nullifier_hash
  // ]

  // [root, nullifier_hash[0]]
}
