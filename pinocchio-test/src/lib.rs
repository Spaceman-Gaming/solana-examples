use pinocchio::{
    account_info::AccountInfo,
    program_entrypoint,
    ProgramResult,
    pubkey::Pubkey
  };
  
use pinocchio_log::log;

program_entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    log!("Hello from my program!");
    Ok(())
}