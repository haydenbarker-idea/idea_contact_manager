/**
 * Database Cleanup Script
 * 
 * Removes ALL users and contacts from the SaaS database
 * Use this to start fresh for production testing
 * 
 * Usage: node scripts/cleanup-database.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanup() {
  console.log('🧹 Starting database cleanup...\n')

  try {
    // Get counts before cleanup
    const userCount = await prisma.user.count()
    const contactCount = await prisma.contact.count()

    console.log(`📊 Current database state:`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Contacts: ${contactCount}\n`)

    if (userCount === 0 && contactCount === 0) {
      console.log('✅ Database is already clean!')
      return
    }

    // Confirm deletion
    console.log('⚠️  This will DELETE ALL users and contacts!')
    console.log('   (Press Ctrl+C within 3 seconds to cancel)\n')

    await new Promise(resolve => setTimeout(resolve, 3000))

    // Delete all contacts first (due to foreign key constraints)
    console.log('🗑️  Deleting all contacts...')
    const deletedContacts = await prisma.contact.deleteMany({})
    console.log(`   ✓ Deleted ${deletedContacts.count} contacts\n`)

    // Delete all users
    console.log('🗑️  Deleting all users...')
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`   ✓ Deleted ${deletedUsers.count} users\n`)

    // Verify cleanup
    const finalUserCount = await prisma.user.count()
    const finalContactCount = await prisma.contact.count()

    console.log('📊 Final database state:')
    console.log(`   - Users: ${finalUserCount}`)
    console.log(`   - Contacts: ${finalContactCount}\n`)

    if (finalUserCount === 0 && finalContactCount === 0) {
      console.log('✅ Database cleanup completed successfully!')
      console.log('🎉 Ready for production testing!\n')
    } else {
      console.log('⚠️  Warning: Some records may still remain')
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanup()

