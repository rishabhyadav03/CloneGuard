use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::CloneGuardError;

#[derive(Accounts)]
#[instruction(apk_hash: [u8; 32])]
pub struct UpdateApp<'info> {
    #[account(
        mut,
        seeds = [b"app", apk_hash.as_ref()],
        bump = app_registry.bump,
        has_one = developer @ CloneGuardError::Unauthorized
    )]
    pub app_registry: Account<'info, AppRegistry>,

    pub developer: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateApp>,
    _apk_hash: [u8; 32],
    new_version: String,
    is_active: bool,
) -> Result<()> {
    require!(new_version.len() <= 32, CloneGuardError::VersionTooLong);

    let app = &mut ctx.accounts.app_registry;
    app.version = new_version;
    app.is_active = is_active;

    msg!("App updated: {}", app.app_name);
    Ok(())
}
