import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Node operations
export async function getNodes() {
  const { data, error } = await supabase
    .from('ens_nodes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createNode(ensName, ethAddress = null, cachedProfile = null) {
  const { data, error } = await supabase
    .from('ens_nodes')
    .upsert({
      ens_name: ensName.toLowerCase(),
      eth_address: ethAddress,
      cached_profile: cachedProfile,
      last_resolved: new Date().toISOString()
    }, { onConflict: 'ens_name' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getNodeByName(ensName) {
  const { data, error } = await supabase
    .from('ens_nodes')
    .select('*')
    .eq('ens_name', ensName.toLowerCase())
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

// Relationship operations
export async function getRelationships() {
  const { data, error } = await supabase
    .from('relationships')
    .select(`
      id,
      source_id,
      target_id,
      relationship_type,
      created_at,
      source:ens_nodes!relationships_source_id_fkey(id, ens_name, eth_address, cached_profile),
      target:ens_nodes!relationships_target_id_fkey(id, ens_name, eth_address, cached_profile)
    `)

  if (error) throw error
  return data
}

export async function createRelationship(sourceId, targetId, relationshipType = 'connection') {
  const { data, error } = await supabase
    .from('relationships')
    .insert({
      source_id: sourceId,
      target_id: targetId,
      relationship_type: relationshipType
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This connection already exists')
    }
    throw error
  }
  return data
}

export async function deleteRelationship(id) {
  const { error } = await supabase
    .from('relationships')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Graph data
export async function getGraphData() {
  const [nodes, relationships] = await Promise.all([
    getNodes(),
    getRelationships()
  ])

  return {
    nodes: nodes || [],
    edges: (relationships || []).map(r => ({
      id: r.id,
      source: r.source_id,
      target: r.target_id,
      type: r.relationship_type,
      sourceNode: r.source,
      targetNode: r.target,
    }))
  }
}

// Helper to create edge by ENS names
export async function createEdgeByNames(sourceName, targetName, relationshipType = 'connection') {
  // Get or create source node
  let sourceNode = await getNodeByName(sourceName)
  if (!sourceNode) {
    sourceNode = await createNode(sourceName)
  }

  // Get or create target node
  let targetNode = await getNodeByName(targetName)
  if (!targetNode) {
    targetNode = await createNode(targetName)
  }

  // Create relationship
  return createRelationship(sourceNode.id, targetNode.id, relationshipType)
}
