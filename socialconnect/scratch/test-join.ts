import { getServiceClient } from './src/lib/supabase'

async function checkFkeys() {
  const supabase = getServiceClient()
  
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower:profiles!follower_id(*),
      following:profiles!following_id(*)
    `)
    .limit(1)

  console.log('Test result:', JSON.stringify({ data, error }, null, 2))
}

checkFkeys()
