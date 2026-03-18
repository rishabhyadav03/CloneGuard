import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import idl from '../idl/clone_guard.json'
import { PROGRAM_ID, NETWORK } from './constants'

export function getProvider(wallet) {
  const connection = new Connection(NETWORK, 'confirmed')
  const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  return provider
}

export function getProgram(wallet) {
  const provider = getProvider(wallet)
  return new Program(idl, provider)
}

export async function getAppRegistryPDA(hashArray) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('app'), Buffer.from(hashArray)],
    PROGRAM_ID
  )
  return pda
}

export async function getDeveloperPDA(developerPublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('developer'), developerPublicKey.toBuffer()],
    PROGRAM_ID
  )
  return pda
}

export async function hashAPK(file) {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  return Array.from(new Uint8Array(hashBuffer))
}