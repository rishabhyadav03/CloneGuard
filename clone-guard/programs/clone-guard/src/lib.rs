use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

use instructions::register_app::*;
use instructions::verify_app::*;
use instructions::report_clone::*;
use instructions::update_app::*;

declare_id!("9YqBRvxkBv7N2RPzEnAdUi4VUVxZB1aukK4sTio5QWha");

#[program]
pub mod clone_guard {
    use super::*;

    pub fn register_app(
    ctx: Context<RegisterApp>,
    apk_hash: [u8; 32],
    app_name: String,
    version: String,
    signature: [u8; 64],
) -> Result<()> {
    instructions::register_app::handler(ctx, apk_hash, app_name, version, signature)
}

    pub fn verify_app(
        ctx: Context<VerifyApp>,
        apk_hash: [u8; 32],
    ) -> Result<()> {
        instructions::verify_app::handler(ctx, apk_hash)
    }

    pub fn report_clone(
        ctx: Context<ReportClone>,
        reported_hash: [u8; 32],
        description: String,
    ) -> Result<()> {
        instructions::report_clone::handler(ctx, reported_hash, description)
    }

    pub fn update_app(
        ctx: Context<UpdateApp>,
        apk_hash: [u8; 32],
        new_version: String,
        is_active: bool,
    ) -> Result<()> {
        instructions::update_app::handler(ctx, apk_hash, new_version, is_active)
    }
}
