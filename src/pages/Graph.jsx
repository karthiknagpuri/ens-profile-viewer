import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import { resolveEnsProfile, normalizeName } from '../services/ensService'
import { getGraphData, createEdgeByNames, deleteRelationship, createNode } from '../services/supabase'
import Avatar from '../components/Avatar'
import { SlideToDeleteConnection } from '../components/ui/slide-to-delete-connection'

const DEFAULT_PAIRS = [
  ['vitalik.eth', 'nick.eth'],
  ['vitalik.eth', 'brantly.eth'],
  ['nick.eth', 'ens.eth'],
]

export default function Graph() {
  const navigate = useNavigate()
  const svgRef = useRef(null)
  const containerRef = useRef(null)

  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [addMode, setAddMode] = useState(false)
  const [sourceNode, setSourceNode] = useState(null)
  const [newNodeInput, setNewNodeInput] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Delete connection popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [edgeToDelete, setEdgeToDelete] = useState(null)

  // Load graph data
  useEffect(() => {
    loadGraph()
  }, [])

  const loadGraph = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getGraphData()

      if (data.nodes.length === 0) {
        // Initialize with default pairs
        for (const [source, target] of DEFAULT_PAIRS) {
          try {
            await createEdgeByNames(source, target)
          } catch (err) {
            console.log('Edge may already exist:', err)
          }
        }
        // Reload
        const freshData = await getGraphData()
        await enrichNodesWithProfiles(freshData.nodes)
        setNodes(freshData.nodes)
        setEdges(freshData.edges)
      } else {
        await enrichNodesWithProfiles(data.nodes)
        setNodes(data.nodes)
        setEdges(data.edges)
      }
    } catch (err) {
      console.error('Failed to load graph:', err)
      setError('Failed to load network graph')
    } finally {
      setLoading(false)
    }
  }

  const enrichNodesWithProfiles = async (nodeList) => {
    await Promise.all(
      nodeList.map(async (node) => {
        if (!node.cached_profile) {
          try {
            const profile = await resolveEnsProfile(node.ens_name)
            node.cached_profile = {
              avatar: profile.avatar,
              displayName: profile.displayName,
              description: profile.description,
            }
            node.eth_address = profile.address
          } catch {
            // Ignore resolution errors
          }
        }
      })
    )
  }

  // D3 visualization
  useEffect(() => {
    if (!nodes.length || !svgRef.current || !containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight || 600

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])

    // Create container group for zoom/pan
    const g = svg.append('g')

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    // Prepare data
    const nodeMap = new Map(nodes.map((n) => [n.id, { ...n }]))
    const nodeArray = Array.from(nodeMap.values())
    const links = edges.map((e) => ({
      ...e,
      source: nodeMap.get(e.source) || e.source,
      target: nodeMap.get(e.target) || e.target,
    })).filter((l) => l.source && l.target)

    const simulation = d3.forceSimulation(nodeArray)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))

    // Store collision force reference to disable during drag
    const collisionForce = simulation.force('collision')

    // Draw edges
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e5e5e5')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation()
        // Show slide-to-delete popup instead of confirm
        setEdgeToDelete({
          id: d.id,
          sourceName: d.source?.ens_name || 'node',
          targetName: d.target?.ens_name || 'node',
          sourceAvatar: d.source?.cached_profile?.avatar,
          targetAvatar: d.target?.cached_profile?.avatar,
        })
        setShowDeletePopup(true)
      })
      .on('mouseover', function () {
        d3.select(this).attr('stroke', '#ff453a').attr('stroke-width', 3)
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke', '#e5e5e5').attr('stroke-width', 2)
      })

    // Track drag state
    let dragSourceNode = null
    let dragTargetNode = null
    let isMagnetActive = false

    // Magnetic pull settings
    const magnetRadius = 100 // Start pulling when within this distance
    const snapRadius = 50 // Snap completely when within this distance
    const magnetStrength = 0.6 // How strong the pull is (0-1)

    // Find closest node within magnetic range
    const findMagneticTarget = (x, y, excludeNode) => {
      let closest = null
      let closestDistance = Infinity

      for (const n of nodeArray) {
        if (n.id === excludeNode.id) continue
        const dx = n.x - x
        const dy = n.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance < magnetRadius && distance < closestDistance) {
          closest = n
          closestDistance = distance
        }
      }
      return closest ? { node: closest, distance: closestDistance } : null
    }

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodeArray)
      .join('g')
      .style('cursor', 'grab')
      .call(d3.drag()
        .on('start', (event, d) => {
          // Disable collision force during drag
          simulation.force('collision', null)
          simulation.force('charge').strength(0) // Disable repulsion too

          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
          dragSourceNode = d
          isMagnetActive = false

          // Highlight source node and bring to front
          const sourceNodeGroup = d3.select(event.sourceEvent.target.parentNode)
          sourceNodeGroup.raise() // Bring to front
          sourceNodeGroup.select('circle')
            .attr('stroke', '#627EEA')
            .attr('stroke-width', 3)
            .attr('filter', 'drop-shadow(0 0 8px rgba(98, 126, 234, 0.5))')
        })
        .on('drag', (event, d) => {
          let targetX = event.x
          let targetY = event.y

          // Check for magnetic target
          const magnetic = findMagneticTarget(event.x, event.y, d)

          // Reset all node highlights except source
          node.select('circle')
            .attr('stroke', (n) => n.id === d.id ? '#627EEA' : '#e5e5e5')
            .attr('stroke-width', (n) => n.id === d.id ? 3 : 2)
            .attr('filter', (n) => n.id === d.id ? 'drop-shadow(0 0 8px rgba(98, 126, 234, 0.5))' : 'none')

          if (magnetic) {
            const { node: targetNode, distance } = magnetic
            dragTargetNode = targetNode
            isMagnetActive = true

            // Calculate magnetic pull strength based on distance
            const pullStrength = Math.min(1, (magnetRadius - distance) / (magnetRadius - snapRadius))

            if (distance <= snapRadius) {
              // Snap directly to target - full overlap
              targetX = targetNode.x
              targetY = targetNode.y
            } else {
              // Magnetic pull - interpolate towards target
              const pull = pullStrength * magnetStrength
              targetX = event.x + (targetNode.x - event.x) * pull
              targetY = event.y + (targetNode.y - event.y) * pull
            }

            // Highlight target node with green glow
            node.filter((n) => n.id === targetNode.id)
              .select('circle')
              .attr('stroke', '#34C759')
              .attr('stroke-width', 4)
              .attr('filter', 'drop-shadow(0 0 12px rgba(52, 199, 89, 0.8))')

            // Scale up target when overlapping
            if (distance <= snapRadius) {
              node.filter((n) => n.id === targetNode.id)
                .attr('transform', `translate(${targetNode.x},${targetNode.y}) scale(1.2)`)
            }
          } else {
            dragTargetNode = null
            isMagnetActive = false
            // Reset any scaled nodes
            node.attr('transform', (n) => `translate(${n.x},${n.y})`)
          }

          d.fx = targetX
          d.fy = targetY
        })
        .on('end', (event, d) => {
          // Re-enable forces
          simulation.force('collision', collisionForce)
          simulation.force('charge').strength(-300)

          if (!event.active) simulation.alphaTarget(0)

          // Reset all node highlights and transforms
          node.select('circle')
            .attr('stroke', '#e5e5e5')
            .attr('stroke-width', 2)
            .attr('filter', 'none')

          node.attr('transform', (n) => `translate(${n.x},${n.y})`)

          // Create connection if dropped on another node
          if (dragTargetNode && dragSourceNode && isMagnetActive) {
            // Check if connection already exists
            const connectionExists = edges.some(e =>
              (e.source === dragSourceNode.id && e.target === dragTargetNode.id) ||
              (e.source === dragTargetNode.id && e.target === dragSourceNode.id)
            )

            if (!connectionExists) {
              handleAddEdge(dragSourceNode.ens_name, dragTargetNode.ens_name)
            }
          }

          d.fx = null
          d.fy = null
          dragSourceNode = null
          dragTargetNode = null
          isMagnetActive = false
        }))

    // Node circles
    node.append('circle')
      .attr('r', 24)
      .attr('fill', '#fff')
      .attr('stroke', '#e5e5e5')
      .attr('stroke-width', 2)

    // Node images (avatars)
    node.append('clipPath')
      .attr('id', (d) => `clip-${d.id}`)
      .append('circle')
      .attr('r', 22)

    node.append('image')
      .attr('xlink:href', (d) => d.cached_profile?.avatar || '')
      .attr('x', -22)
      .attr('y', -22)
      .attr('width', 44)
      .attr('height', 44)
      .attr('clip-path', (d) => `url(#clip-${d.id})`)
      .on('error', function () {
        d3.select(this).remove()
      })

    // Fallback circle for nodes without avatars
    node.filter((d) => !d.cached_profile?.avatar)
      .select('circle')
      .attr('fill', (d) => {
        const hash = d.eth_address?.slice(2, 8) || d.ens_name.slice(0, 6)
        return `#${hash.padEnd(6, '0').slice(0, 6)}`
      })

    // Node labels
    node.append('text')
      .text((d) => d.ens_name)
      .attr('text-anchor', 'middle')
      .attr('dy', 40)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#1d1d1f')

    // Click handlers
    node.on('click', (event, d) => {
      event.stopPropagation()
      if (addMode) {
        if (!sourceNode) {
          setSourceNode(d)
        } else {
          handleAddEdge(sourceNode.ens_name, d.ens_name)
          setSourceNode(null)
          setAddMode(false)
        }
      } else {
        navigate(`/profile/${encodeURIComponent(d.ens_name)}`)
      }
    })

    node.on('mouseover', function (event, d) {
      setSelectedNode(d)
      d3.select(this).select('circle')
        .attr('stroke', '#1d1d1f')
        .attr('stroke-width', 3)
    })

    node.on('mouseout', function () {
      setSelectedNode(null)
      d3.select(this).select('circle')
        .attr('stroke', '#e5e5e5')
        .attr('stroke-width', 2)
    })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('transform', (d) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [nodes, edges, addMode, sourceNode, navigate])

  const handleAddEdge = async (sourceName, targetName) => {
    try {
      await createEdgeByNames(sourceName, targetName)
      await loadGraph()
    } catch (err) {
      alert(err.message || 'Failed to add connection')
    }
  }

  const handleDeleteEdge = async (edgeId) => {
    try {
      await deleteRelationship(edgeId)
      await loadGraph()
    } catch (err) {
      alert(err.message || 'Failed to delete connection')
    }
  }

  const handleConfirmDelete = async () => {
    if (edgeToDelete) {
      await handleDeleteEdge(edgeToDelete.id)
    }
    setShowDeletePopup(false)
    setEdgeToDelete(null)
  }

  const handleCancelDelete = () => {
    setShowDeletePopup(false)
    setEdgeToDelete(null)
  }

  const handleAddNewNode = async () => {
    if (!newNodeInput.trim()) return

    try {
      const name = normalizeName(newNodeInput)
      await createNode(name)
      setNewNodeInput('')
      setShowAddModal(false)
      await loadGraph()
    } catch (err) {
      alert(err.message || 'Failed to add node')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6e6e73]">Loading network graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="text-center">
          <p className="text-[#ff453a] mb-4">{error}</p>
          <button
            onClick={loadGraph}
            className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Graph container */}
      <div ref={containerRef} className="flex-1 relative bg-[#fafafa] overflow-hidden">
        <svg ref={svgRef} className="w-full h-full" />

        {/* Desktop: Floating action buttons - left middle */}
        <div className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col gap-3">
          {addMode ? (
            <div className="bg-white rounded-xl border border-[#e5e5e5] p-3 shadow-lg">
              <p className="text-xs text-[#6e6e73] mb-2">
                {sourceNode ? `Select target` : 'Select source'}
              </p>
              {sourceNode && (
                <p className="text-xs font-medium text-[#1d1d1f] mb-2">{sourceNode.ens_name}</p>
              )}
              <button
                onClick={() => {
                  setAddMode(false)
                  setSourceNode(null)
                }}
                className="w-full px-3 py-2 bg-[#f5f5f5] text-[#1d1d1f] rounded-lg text-xs font-medium hover:bg-[#e5e5e5] active:scale-95 transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-white border border-[#e5e5e5] rounded-full shadow-lg hover:bg-[#f5f5f5] active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 text-[#1d1d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium text-[#1d1d1f]">Add Node</span>
              </button>
              <button
                onClick={() => setAddMode(true)}
                className="flex items-center gap-2 px-4 py-3 bg-[#1d1d1f] rounded-full shadow-lg hover:bg-black active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-sm font-medium text-white">Connect</span>
              </button>
            </>
          )}
        </div>

        {/* Desktop: Stats - bottom center */}
        <div className="hidden sm:flex absolute bottom-4 left-1/2 -translate-x-1/2 items-center gap-4 bg-white/90 backdrop-blur-sm border border-[#e5e5e5] rounded-full px-5 py-2 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#627EEA]" />
            <span className="text-sm font-medium text-[#1d1d1f]">{nodes.length}</span>
            <span className="text-xs text-[#6e6e73]">nodes</span>
          </div>
          <div className="w-px h-4 bg-[#e5e5e5]" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span className="text-sm font-medium text-[#1d1d1f]">{edges.length}</span>
            <span className="text-xs text-[#6e6e73]">links</span>
          </div>
        </div>

        {/* Mobile: Combined stats and actions bar */}
        <div className="sm:hidden absolute bottom-24 left-3 right-3">
          {addMode ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-[#e5e5e5] p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#6e6e73]">
                    {sourceNode ? `Select target node` : 'Select source node'}
                  </p>
                  {sourceNode && (
                    <p className="text-sm font-medium text-[#1d1d1f]">{sourceNode.ens_name}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setAddMode(false)
                    setSourceNode(null)
                  }}
                  className="px-4 py-2 bg-[#f5f5f5] text-[#1d1d1f] rounded-full text-xs font-medium active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white/95 backdrop-blur-sm rounded-2xl border border-[#e5e5e5] px-3 py-2 shadow-lg">
              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#627EEA]" />
                  <span className="text-xs font-medium text-[#1d1d1f]">{nodes.length}</span>
                  <span className="text-[10px] text-[#6e6e73]">nodes</span>
                </div>
                <div className="w-px h-3 bg-[#e5e5e5]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  <span className="text-xs font-medium text-[#1d1d1f]">{edges.length}</span>
                  <span className="text-[10px] text-[#6e6e73]">links</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f5] rounded-full active:scale-95 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-[#1d1d1f]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs font-medium text-[#1d1d1f]">Add</span>
                </button>
                <button
                  onClick={() => setAddMode(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1d1d1f] rounded-full active:scale-95 transition-all"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-xs font-medium text-white">Connect</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Node tooltip */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bg-white rounded-xl border border-[#e5e5e5] p-4 shadow-lg max-w-xs">
            <div className="flex items-center gap-3">
              <Avatar
                src={selectedNode.cached_profile?.avatar}
                address={selectedNode.eth_address}
                name={selectedNode.ens_name}
                size="sm"
              />
              <div>
                <p className="font-semibold text-[#1d1d1f]">{selectedNode.ens_name}</p>
                {selectedNode.cached_profile?.displayName && (
                  <p className="text-sm text-[#6e6e73]">{selectedNode.cached_profile.displayName}</p>
                )}
              </div>
            </div>
            {selectedNode.cached_profile?.description && (
              <p className="mt-2 text-sm text-[#6e6e73] line-clamp-2">
                {selectedNode.cached_profile.description}
              </p>
            )}
            <p className="mt-2 text-xs text-[#86868b]">Click to view profile</p>
          </div>
        )}
      </div>

      {/* Add Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">Add ENS Node</h2>
            <input
              type="text"
              value={newNodeInput}
              onChange={(e) => setNewNodeInput(e.target.value)}
              placeholder="Enter ENS name (e.g., vitalik.eth)"
              className="w-full px-4 py-3 bg-[#f5f5f5] rounded-xl border-0 text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-black/10"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddNewNode()
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewNodeInput('')
                }}
                className="px-4 py-2 text-[#6e6e73] hover:text-[#1d1d1f] text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewNode}
                className="px-5 py-2 bg-black text-white rounded-full text-sm font-medium"
              >
                Add Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide to Delete Connection Popup */}
      <AnimatePresence>
        {showDeletePopup && edgeToDelete && (
          <SlideToDeleteConnection
            connection={edgeToDelete}
            onDelete={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
