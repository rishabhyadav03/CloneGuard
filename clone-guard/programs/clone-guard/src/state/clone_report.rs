use anchor_lang::prelude::*;

#[account]
pub struct CloneReport {
    pub reporter: Pubkey,        // 32
    pub reported_hash: [u8; 32], // 32
    pub genuine_app: Pubkey,     // 32
    pub timestamp: i64,          // 8
    pub description: String,     // 4 + 128
    pub bump: u8,                // 1
}

impl CloneReport {
    pub const SPACE: usize = 8 + 32 + 32 + 32 + 8 + (4 + 128) + 1;
}
