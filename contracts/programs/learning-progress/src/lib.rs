use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod learning_progress {
    use super::*;

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.owner = ctx.accounts.user.key();
        user_account.total_modules_completed = 0;
        user_account.current_level = 1;
        Ok(())
    }

    pub fn complete_module(
        ctx: Context<CompleteModule>,
        module_id: String,
        score: u8,
    ) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        
        // Update progress
        user_account.total_modules_completed += 1;
        
        // Mint achievement NFT if score is high enough
        if score >= 80 {
            // Logic to mint NFT will go here
            emit!(ModuleCompleted {
                user: ctx.accounts.user.key(),
                module_id,
                score,
                timestamp: Clock::get()?.unix_timestamp,
            });
        }
        
        Ok(())
    }

    pub fn update_level(ctx: Context<UpdateLevel>, new_level: u8) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        user_account.current_level = new_level;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 1, // discriminator + pubkey + total_modules + level
        seeds = [b"user-progress", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserProgress>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteModule<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user-progress", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserProgress>,
}

#[derive(Accounts)]
pub struct UpdateLevel<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user-progress", user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserProgress>,
}

#[account]
pub struct UserProgress {
    pub owner: Pubkey,
    pub total_modules_completed: u64,
    pub current_level: u8,
}

#[event]
pub struct ModuleCompleted {
    pub user: Pubkey,
    pub module_id: String,
    pub score: u8,
    pub timestamp: i64,
}
