use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::CloneGuardError;

#[derive(Accounts)]
#[instruction(apk_hash: [u8; 32])]
pub struct RegisterApp<'info> {
    #[account(
        init,
        payer = developer,
        space = AppRegistry::SPACE,
        seeds = [b"app", apk_hash.as_ref()],
        bump
    )]
    pub app_registry: Account<'info, AppRegistry>,

    #[account(
        init_if_needed,
        payer = developer,
        space = Developer::SPACE,
        seeds = [b"developer", developer.key().as_ref()],
        bump
    )]
    pub developer_account: Account<'info, Developer>,

    #[account(mut)]
    pub developer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterApp>,
    apk_hash: [u8; 32],
    app_name: String,
    version: String,
    signature: [u8; 64],
) -> Result<()> {
    require!(app_name.len() <= 64, CloneGuardError::NameTooLong);
    require!(version.len() <= 32, CloneGuardError::VersionTooLong);

    let app = &mut ctx.accounts.app_registry;
    app.developer = ctx.accounts.developer.key();
    app.apk_hash = apk_hash;
    app.app_name = app_name;
    app.version = version;
    app.timestamp = Clock::get()?.unix_timestamp;
    app.is_active = true;
    app.is_flagged = false;
    app.verify_count = 0;
    app.signature = signature;
    app.bump = ctx.bumps.app_registry;

    let dev = &mut ctx.accounts.developer_account;
    dev.authority = ctx.accounts.developer.key();
    dev.app_count += 1;
    dev.bump = ctx.bumps.developer_account;

    msg!("App registered with Ed25519 signature: {:?}", apk_hash);
    Ok(())
}