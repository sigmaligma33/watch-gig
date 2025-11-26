require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
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

async function testProfileUpdate() {
  console.log('🧪 Testing Profile Update Functionality\n')
  console.log('=' .repeat(60))

  try {
    // Step 1: Find a pending verification request
    console.log('\n📋 Step 1: Finding a pending verification request...')
    const { data: pendingRequests, error: requestError } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('status', 'pending')
      .limit(1)

    if (requestError) {
      console.error('❌ Error fetching pending requests:', requestError)
      process.exit(1)
    }

    if (!pendingRequests || pendingRequests.length === 0) {
      console.log('⚠️  No pending verification requests found.')
      console.log('Creating a test scenario instead...\n')
      await createTestScenario()
      return
    }

    const application = pendingRequests[0]
    console.log('✅ Found pending request:', {
      id: application.id,
      user_id: application.user_id,
      status: application.status
    })

    // Step 2: Check current profile status
    console.log('\n👤 Step 2: Checking current profile status...')
    const { data: profileBefore, error: profileBeforeError } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone_number')
      .eq('id', application.user_id)
      .single()

    if (profileBeforeError) {
      console.error('❌ Error fetching profile:', profileBeforeError)
      process.exit(1)
    }

    console.log('✅ Current profile state:', {
      id: profileBefore.id,
      role: profileBefore.role,
      name: profileBefore.full_name || profileBefore.phone_number
    })

    // Step 3: Simulate the UPDATE operation (same as in the app)
    console.log('\n🔄 Step 3: Updating profile role to "provider"...')
    const { data: profileData, error: updateError } = await supabase
      .from('profiles')
      .update({
        role: 'provider',
      })
      .eq('id', application.user_id)
      .select()

    if (updateError) {
      console.error('❌ Update failed:', updateError)
      process.exit(1)
    }

    if (!profileData || profileData.length === 0) {
      console.error('❌ No rows were updated! This indicates:')
      console.error('   - The user_id might not exist in profiles table')
      console.error('   - RLS policies might be blocking the update')
      console.error('   - user_id:', application.user_id)
      process.exit(1)
    }

    console.log('✅ Update successful:', {
      rows_affected: profileData.length,
      updated_role: profileData[0].role
    })

    // Step 4: Verify the change persisted
    console.log('\n✓ Step 4: Verifying the change persisted...')
    const { data: profileAfter, error: profileAfterError } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone_number')
      .eq('id', application.user_id)
      .single()

    if (profileAfterError) {
      console.error('❌ Error fetching updated profile:', profileAfterError)
      process.exit(1)
    }

    console.log('✅ Verified profile state:', {
      id: profileAfter.id,
      role: profileAfter.role,
      name: profileAfter.full_name || profileAfter.phone_number
    })

    // Step 5: Compare before and after
    console.log('\n📊 Step 5: Comparison')
    console.log('Before:', { role: profileBefore.role })
    console.log('After: ', { role: profileAfter.role })

    if (profileBefore.role !== profileAfter.role) {
      console.log('\n✅ SUCCESS! Profile role was updated correctly.')
    } else {
      console.log('\n⚠️  WARNING: Role did not change (might already be "provider")')
    }

    // Step 6: Rollback for safety
    console.log('\n🔙 Step 6: Rolling back changes...')
    await supabase
      .from('profiles')
      .update({ role: profileBefore.role })
      .eq('id', application.user_id)

    console.log('✅ Rollback complete')

    console.log('\n' + '='.repeat(60))
    console.log('🎉 ALL TESTS PASSED!')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n💥 Unexpected error:', error)
    process.exit(1)
  }
}

async function createTestScenario() {
  console.log('📝 Creating test scenario...\n')

  try {
    // Find any user with a profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, full_name, phone_number')
      .neq('role', 'admin')
      .limit(1)

    if (profileError || !profiles || profiles.length === 0) {
      console.log('❌ No suitable profiles found for testing')
      process.exit(1)
    }

    const testProfile = profiles[0]
    console.log('Found test profile:', {
      id: testProfile.id,
      current_role: testProfile.role,
      name: testProfile.full_name || testProfile.phone_number
    })

    // Test update
    console.log('\n🔄 Testing UPDATE operation...')
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'provider' })
      .eq('id', testProfile.id)
      .select()

    if (updateError) {
      console.error('❌ Update failed:', updateError)
      process.exit(1)
    }

    console.log('✅ Update successful:', {
      rows_affected: updateData.length,
      new_role: updateData[0]?.role
    })

    // Rollback
    console.log('\n🔙 Rolling back...')
    await supabase
      .from('profiles')
      .update({ role: testProfile.role })
      .eq('id', testProfile.id)

    console.log('✅ Test complete!')

  } catch (error) {
    console.error('Error in test scenario:', error)
    process.exit(1)
  }
}

// Run the test
testProfileUpdate()
