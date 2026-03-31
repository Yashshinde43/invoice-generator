const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseAndFix() {
  console.log('=== DIAGNOSING AUTH ISSUE ===\n');

  // 1. Check if user exists in auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.log('Error listing users:', listError.message);
    return;
  }

  const testUser = users.find(u => u.email === 'chiragsinghchauhan3949323@gmail.com');

  if (!testUser) {
    console.log('❌ User not found in auth. Creating new user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'chiragsinghchauhan3949323@gmail.com',
      password: 'chirag@123',
      email_confirm: true,
      user_metadata: { full_name: 'Chirag Singh Chauhan' }
    });

    if (createError) {
      console.log('Error creating user:', createError.message);
    } else {
      console.log('✅ User created:', newUser.user.id);
      console.log('   Email:', newUser.user.email);
      console.log('   Confirmed:', newUser.user.email_confirmed_at);

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: newUser.user.email,
          full_name: 'Chirag Singh Chauhan'
        });

      if (profileError) {
        console.log('Profile creation error:', profileError.message);
      } else {
        console.log('✅ Profile created');
      }
    }
  } else {
    console.log('✅ User found:', testUser.id);
    console.log('   Email:', testUser.email);
    console.log('   Confirmed:', testUser.email_confirmed_at);
    console.log('   Created:', testUser.created_at);
    console.log('   Updated:', testUser.updated_at);

    // 2. Update user password to fix any auth issues
    console.log('\n=== RESETTING PASSWORD TO FIX AUTH ===');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(testUser.id, {
      password: 'chirag@123',
      email_confirm: true
    });

    if (updateError) {
      console.log('Error updating user:', updateError.message);
    } else {
      console.log('✅ Password reset successfully');
      console.log('✅ Email confirmed forced to true');
    }
  }

  const userId = testUser?.id;

  // 3. Check profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.log('\n❌ Profile error:', profileError.message);
  } else if (profile) {
    console.log('\n✅ Profile found:', profile.id);
  } else {
    console.log('\n⚠️  Profile not found, creating...');
    const { error: insertProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'chiragsinghchauhan3949323@gmail.com',
        full_name: 'Chirag Singh Chauhan'
      });

    if (insertProfileError) {
      console.log('Profile insert error:', insertProfileError.message);
    } else {
      console.log('✅ Profile created');
    }
  }

  // 4. Check business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', userId)
    .maybeSingle();

  if (businessError) {
    console.log('Business error:', businessError.message);
  } else if (business) {
    console.log('✅ Business found:', business.id, '-', business.name);
  } else {
    console.log('\n⚠️  Business not found, creating...');
    const { error: insertBusinessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: userId,
        name: 'My Business',
        is_default: true
      });

    if (insertBusinessError) {
      console.log('Business insert error:', insertBusinessError.message);
    } else {
      console.log('✅ Business created');
    }
  }

  console.log('\n=== FIX COMPLETE ===');
  console.log('You can now try logging in with:');
  console.log('Email: chiragsinghchauhan3949323@gmail.com');
  console.log('Password: chirag@123');
}

diagnoseAndFix().catch(console.error);
