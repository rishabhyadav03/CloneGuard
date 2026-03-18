use anchor_lang::prelude::*;

#[error_code]
pub enum CloneGuardError {
    #[msg("App hash already registered")]
    AppAlreadyRegistered,
    #[msg("App not found in registry")]
    AppNotFound,
    #[msg("Unauthorized: you are not the developer of this app")]
    Unauthorized,
    #[msg("Invalid APK hash: must be 32 bytes")]
    InvalidHash,
    #[msg("Invalid ZK proof")]
    InvalidProof,
    #[msg("App has been flagged as malicious")]
    AppFlagged,
    #[msg("App name too long (max 64 chars)")]
    NameTooLong,
    #[msg("Version string too long (max 32 chars)")]
    VersionTooLong,
}
