use anchor_lang::prelude::*;

#[account]
pub struct AppRegistry {
    pub developer: Pubkey,       // 32
    pub apk_hash: [u8; 32],      // 32
    pub app_name: String,        // 4 + 64
    pub version: String,         // 4 + 32
    pub timestamp: i64,          // 8
    pub is_active: bool,         // 1
    pub is_flagged: bool,        // 1
    pub verify_count: u64,       // 8
    pub signature: [u8; 64],     // 64 — Ed25519 signature
    pub bump: u8,                // 1
}

impl AppRegistry {
    pub const SPACE: usize = 8 + 32 + 32 + (4 + 64) + (4 + 32) + 8 + 1 + 1 + 8 + 64 + 1;
}