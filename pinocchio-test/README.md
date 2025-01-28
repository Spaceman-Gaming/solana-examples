# Pinocchio Test

### Notes
- `cargo new --lib pinocchio-test`
- Add `crate-type = ["cdylib", "lib"]` to `Cargo.toml`

### Errors
- `cargo build-sbf` fails with error: not a directory: `...` 
    - nuke `$HOME/.cache/solana`
    - try it again, will redownload the toolchain
- `error: failed to parse manifest at `[...]/Cargo.toml`
    - cargo-features = ["edition2024"] at the top of `Cargo.toml`
- `error: lock file version 4 requires -Znext-lockfile-bump`
    - make the '4' in Cargo.lock a '3' at the top
