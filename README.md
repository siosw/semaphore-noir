# Semaphore Noir

## Notes

- it's important to specify the exact Noir TS SDK versions to avoid running into this bug: https://github.com/noir-lang/noir/issues/586
- when trying to implement automated tests we are currently running into this: https://github.com/noir-lang/noir/issues/888
- to be compatible with the EF Semaphore SDK we need to use Poseidon hashes - this is depending on https://github.com/noir-lang/noir/pull/768 being merged
