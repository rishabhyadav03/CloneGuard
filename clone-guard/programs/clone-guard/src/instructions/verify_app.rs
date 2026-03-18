use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::CloneGuardError;

#[derive(Accounts)]
#[instruction(apk_hash: [u8; 32])]
pub struct VerifyApp<'info> {
    #[account(
        mut,
        seeds = [b"app", apk_hash.as_ref()],
        bump = app_registry.bump
    )]
    pub app_registry: Account<'info, AppRegistry>,

    pub user: Signer<'info>,
}

pub fn handler(ctx: Context<VerifyApp>, _apk_hash: [u8; 32]) -> Result<()> {
    let app = &mut ctx.accounts.app_registry;
    require!(!app.is_flagged, CloneGuardError::AppFlagged);
    require!(app.is_active, CloneGuardError::AppNotFound);

    app.verify_count += 1;

    msg!("App verified: {} | Count: {}", app.app_name, app.verify_count);
    Ok(())
}
