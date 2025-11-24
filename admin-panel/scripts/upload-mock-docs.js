require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create a simple SVG image as a placeholder for ID documents
function createMockIDImage(name, type) {
  return `<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="400" fill="#f0f0f0"/>
  <rect x="10" y="10" width="580" height="380" fill="white" stroke="#333" stroke-width="2"/>
  
  <!-- Header -->
  <rect x="20" y="20" width="560" height="60" fill="#2d6a4f"/>
  <text x="300" y="55" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
    NATIONAL ID CARD
  </text>
  
  <!-- Photo placeholder -->
  <rect x="30" y="100" width="120" height="150" fill="#d0d0d0" stroke="#666" stroke-width="1"/>
  <text x="90" y="180" font-family="Arial" font-size="14" fill="#666" text-anchor="middle">
    PHOTO
  </text>
  
  <!-- ${type.toUpperCase()} SIDE -->
  <text x="170" y="120" font-family="Arial" font-size="18" fill="#333" font-weight="bold">
    ${type.toUpperCase()} SIDE
  </text>
  
  <!-- Personal Details -->
  <text x="170" y="150" font-family="Arial" font-size="14" fill="#333">
    Name: ${name}
  </text>
  <text x="170" y="175" font-family="Arial" font-size="14" fill="#333">
    ID Number: ${Math.floor(Math.random() * 9000000000) + 1000000000}
  </text>
  <text x="170" y="200" font-family="Arial" font-size="14" fill="#333">
    Date of Birth: ${new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString()}
  </text>
  <text x="170" y="225" font-family="Arial" font-size="14" fill="#333">
    Nationality: Ugandan
  </text>
  
  ${type === 'back' ? `
  <!-- Back side specific info -->
  <text x="30" y="280" font-family="Arial" font-size="12" fill="#666">
    Issue Date: ${new Date(2020, 0, 1).toLocaleDateString()}
  </text>
  <text x="30" y="300" font-family="Arial" font-size="12" fill="#666">
    Expiry Date: ${new Date(2030, 0, 1).toLocaleDateString()}
  </text>
  
  <!-- Barcode placeholder -->
  <rect x="30" y="320" width="540" height="50" fill="white" stroke="#333" stroke-width="1"/>
  <pattern id="barcode" patternUnits="userSpaceOnUse" width="10" height="50">
    <rect width="4" height="50" fill="#000"/>
  </pattern>
  <rect x="30" y="320" width="540" height="50" fill="url(#barcode)"/>
  ` : ''}
  
  <!-- Footer -->
  <text x="300" y="385" font-family="Arial" font-size="10" fill="#999" text-anchor="middle">
    MOCK DOCUMENT - FOR TESTING PURPOSES ONLY
  </text>
</svg>`
}

const testUsers = [
  { id: '13b1c806-3513-4894-a404-fb1e0619387a', name: 'John Smith' },
  { id: '7450a325-64db-4e3f-afc7-7160b5b865ad', name: 'Mary Johnson' },
  { id: 'f7121a51-ddea-42dc-9190-d93d8bd04d9b', name: 'David Brown' },
  { id: '4ad51746-d6ba-4bae-b720-699f7b9fe057', name: 'Sarah Williams' },
  { id: '318d3d84-814f-44e7-a87f-35277af3bdcb', name: 'Michael Davis' }
]

async function uploadMockDocuments() {
  console.log('Creating and uploading mock ID documents...\n')

  for (const user of testUsers) {
    console.log(`Processing ${user.name} (${user.id})...`)
    
    // Create front and back images
    const frontSVG = createMockIDImage(user.name, 'front')
    const backSVG = createMockIDImage(user.name, 'back')
    
    // Upload front image
    const frontPath = `${user.id}/national_id_front_mock.jpg`
    const { data: frontData, error: frontError } = await supabase.storage
      .from('verification-documents')
      .upload(frontPath, Buffer.from(frontSVG), {
        contentType: 'image/svg+xml',
        upsert: true
      })
    
    if (frontError) {
      console.error(`  ✗ Error uploading front image:`, frontError.message)
    } else {
      console.log(`  ✓ Front image uploaded: ${frontPath}`)
    }
    
    // Upload back image
    const backPath = `${user.id}/national_id_back_mock.jpg`
    const { data: backData, error: backError } = await supabase.storage
      .from('verification-documents')
      .upload(backPath, Buffer.from(backSVG), {
        contentType: 'image/svg+xml',
        upsert: true
      })
    
    if (backError) {
      console.error(`  ✗ Error uploading back image:`, backError.message)
    } else {
      console.log(`  ✓ Back image uploaded: ${backPath}`)
    }
    
    console.log('')
  }
  
  console.log('✅ All mock documents uploaded successfully!')
  console.log('\nYou can now view these applications in the admin panel.')
}

uploadMockDocuments().catch(console.error)
