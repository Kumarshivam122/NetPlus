const supabase = require('./db/supabase');

async function addImageUrlColumn() {
  console.log('Adding image_url column to products table...');
  
  // Use Supabase's rpc or raw SQL to add the column
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: "ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;"
  });

  if (error) {
    // If rpc doesn't exist, try using the REST approach
    console.log('RPC method not available, trying direct query...');
    console.log('');
    console.log('============================================================');
    console.log('  Please run this SQL in your Supabase Dashboard SQL Editor:');
    console.log('============================================================');
    console.log('');
    console.log('  ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT NULL;');
    console.log('');
    console.log('============================================================');
    console.log('');
    console.log('Go to: https://supabase.com/dashboard → Your Project → SQL Editor → New Query');
    console.log('Paste the SQL above and click "Run"');
    console.log('');
    
    // Try to verify if column already exists by attempting a select
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('image_url')
      .limit(1);
    
    if (testError) {
      console.log('❌ Column "image_url" does NOT exist yet. Please run the SQL above.');
    } else {
      console.log('✅ Column "image_url" already exists! No action needed.');
    }
  } else {
    console.log('✅ image_url column added successfully!');
  }
}

addImageUrlColumn().catch(console.error);
