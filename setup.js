#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🚀 Setting up Real-time Chat Application...\n')

// Check if .env file exists
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...')
  const envContent = `# Database
DATABASE_URL="mysql://root:password@localhost:3306/chat_app"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here-change-this-in-production"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here-change-this-in-production"
`
  fs.writeFileSync(envPath, envContent)
  console.log('✅ .env file created successfully!')
  console.log('⚠️  Please update the DATABASE_URL with your MySQL credentials\n')
} else {
  console.log('✅ .env file already exists\n')
}

// Create uploads directory
const uploadsPath = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsPath)) {
  console.log('📁 Creating uploads directory...')
  fs.mkdirSync(uploadsPath, { recursive: true })
  console.log('✅ Uploads directory created successfully!\n')
} else {
  console.log('✅ Uploads directory already exists\n')
}

console.log('🎉 Setup complete! Next steps:')
console.log('1. Update your .env file with your MySQL database credentials')
console.log('2. Run: npx prisma generate')
console.log('3. Run: npx prisma migrate dev --name init')
console.log('4. Run: npm run dev')
console.log('5. Open http://localhost:3000 in your browser\n')

console.log('📚 For more information, check the README.md file') 