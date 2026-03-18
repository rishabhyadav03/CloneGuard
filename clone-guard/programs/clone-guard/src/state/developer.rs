use anchor_lang::prelude::*;

#[account]
pub struct Developer {
    pub authority: Pubkey,       // 32
    pub app_count: u64,          // 8
    pub bump: u8,                // 1
}

impl Developer {
    pub const SPACE: usize = 8 + 32 + 8 + 1;
}
