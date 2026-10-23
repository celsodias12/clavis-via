import { readFile } from 'node:fs/promises'
import { createClerkApi } from '../clerk-api.ts'
import { ensureDemoAccount } from '../demo-account.ts'

const avatarPath = new URL('../../assets/demo-avatar.jpg', import.meta.url)

const clerkApi = createClerkApi({ secretKey: process.env.CLERK_SECRET_KEY ?? '' })
const image = new Blob([await readFile(avatarPath)], { type: 'image/jpeg' })
const user = await ensureDemoAccount(clerkApi, {
  email: process.env.DEMO_EMAIL ?? '',
  password: process.env.DEMO_PASSWORD ?? '',
  firstName: 'Ana',
  image,
})
console.log(`Demo account ready: ${user.id}`)
