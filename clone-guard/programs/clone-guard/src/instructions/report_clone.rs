use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(reported_hash: [u8; 32])]
pub struct ReportClone<'info> {
    #[account(
        init,
        payer = reporter,
        space = CloneReport::SPACE,
        seeds = [b"report", reporter.key().as_ref(), reported_hash.as_ref()],
        bump
    )]
    pub clone_report: Account<'info, CloneReport>,

    #[account(
        seeds = [b"app", genuine_app.apk_hash.as_ref()],
        bump = genuine_app.bump
    )]
    pub genuine_app: Account<'info, AppRegistry>,

    #[account(mut)]
    pub reporter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<ReportClone>,
    reported_hash: [u8; 32],
    description: String,
) -> Result<()> {
    let report = &mut ctx.accounts.clone_report;
    report.reporter = ctx.accounts.reporter.key();
    report.reported_hash = reported_hash;
    report.genuine_app = ctx.accounts.genuine_app.key();
    report.timestamp = Clock::get()?.unix_timestamp;
    report.description = description;
    report.bump = ctx.bumps.clone_report;

    msg!("Clone reported: {:?}", reported_hash);
    Ok(())
}
