require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'gighubsigma@gmail.com',
      password: 'Password123$',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      process.exit(1)
    }

    console.log('✓ Auth user created:', authData.user.id)

    // Create/update the profile with admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        role: 'admin',
        phone_number: '',
        full_name: 'GigHub Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Try to clean up the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      process.exit(1)
    }

    console.log('✓ Profile created with admin role')
    console.log('\n✅ Admin user successfully created!')
    console.log('Email: gighubsigma@gmail.com')
    console.log('Password: Password123$')
    console.log('Role: admin')
    console.log('\nYou can now login to the admin panel.')

  } catch (error) {
    console.error('Unexpected error:', error)
    process.exit(1)
  }
}

createAdminUser()
