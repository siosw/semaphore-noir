

use dep::std;

fn main(
  id_nullifier: Field,
  id_trapdoor: Field,
  pub_commitment: pub Field,
) {
  // reconstruct the commitment from the private nullfiers
  let secret =  std::hash::pedersen([id_nullifier, id_trapdoor]);
  let id_commitment =  std::hash::pedersen([secret[0]]);

  constrain pub_commitment == id_commitment[0];

}
