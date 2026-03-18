import { ed25519 } from '../../node_modules/@noble/curves/esm/ed25519.js'

export async function signAPKHash(hashArray, signMessage) {
  // Convert hash to hex string first — must be pure UTF-8 text for Phantom Standard Wallet
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  // Build a human-readable UTF-8 message — Phantom shows this to the user
  const messageText = `Registering app on CloneGuard\nSHA256: ${hexHash}`
  
  // Encode as UTF-8 bytes
  const messageBytes = new TextEncoder().encode(messageText)
  
  // signMessage returns Uint8Array directly from wallet adapter
  const signature = await signMessage(messageBytes)
  return Array.from(signature)
}

export function verifySignature(hashArray, signatureArray, publicKeyArray) {
  try {
    // Must reconstruct exact same message as signing
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    const messageText = `Registering app on CloneGuard\nSHA256: ${hexHash}`
    const messageBytes = new TextEncoder().encode(messageText)
    
    const sig = new Uint8Array(signatureArray)
    const pub = new Uint8Array(publicKeyArray)
    return ed25519.verify(sig, messageBytes, pub)
  } catch (e) {
    console.error('Verify error:', e)
    return false
  }
}