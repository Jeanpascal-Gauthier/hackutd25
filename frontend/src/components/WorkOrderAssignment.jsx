import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useReducedMotion } from '../hooks/useReducedMotion'
import PrimaryButton from './PrimaryButton'

function WorkOrderAssignment({ workOrder, isOpen, onClose, onAssign }) {
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [loading, setLoading] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Mock technicians with expertise - in real app, fetch from API
  const technicians = [
    { 
      id: 'tech-1', 
      name: 'John Smith', 
      team: 'compute', 
      available: true,
      expertise: ['gpu', 'nvidia', 'a100', 'h100', 'compute', 'hardware-repair', 'power-systems'],
      experience: 5,
      rating: 4.8,
      specialties: {
        'gpu': 'Expert in GPU node replacement and troubleshooting',
        'nvidia': 'Specialized in NVIDIA hardware repairs',
        'a100': 'Certified A100 installation and maintenance',
        'h100': 'H100 system configuration expert',
        'power-systems': 'PSU replacement and power distribution',
        'hardware-repair': 'General hardware repair and diagnostics'
      }
    },
    { 
      id: 'tech-2', 
      name: 'Sarah Johnson', 
      team: 'network', 
      available: true,
      expertise: ['networking', 'switches', 'routers', 'cabling', 'fiber', 'ethernet'],
      experience: 7,
      rating: 4.9,
      specialties: {
        'networking': 'Network infrastructure troubleshooting',
        'switches': 'Switch configuration and replacement',
        'routers': 'Router maintenance and upgrades',
        'cabling': 'Fiber and ethernet cable management',
        'fiber': 'Fiber optic installation and repair'
      }
    },
    { 
      id: 'tech-3', 
      name: 'Mike Chen', 
      team: 'storage', 
      available: false,
      expertise: ['storage', 'disks', 'ssd', 'raid', 'backup-systems'],
      experience: 4,
      rating: 4.6,
      specialties: {
        'storage': 'Storage array management',
        'disks': 'Disk drive replacement and RAID rebuilds',
        'ssd': 'SSD installation and optimization',
        'raid': 'RAID configuration and recovery'
      }
    },
    { 
      id: 'tech-4', 
      name: 'Emily Davis', 
      team: 'compute', 
      available: true,
      expertise: ['gpu', 'compute', 'servers', 'cooling', 'thermal-management'],
      experience: 3,
      rating: 4.7,
      specialties: {
        'cooling': 'Cooling system maintenance and optimization',
        'thermal-management': 'Temperature monitoring and control',
        'servers': 'Server hardware diagnostics',
        'compute': 'Compute node troubleshooting'
      }
    },
    { 
      id: 'tech-5', 
      name: 'David Martinez', 
      team: 'network', 
      available: true,
      expertise: ['networking', 'switches', 'cabling', 'troubleshooting', 'power-systems'],
      experience: 6,
      rating: 4.8,
      specialties: {
        'networking': 'Complex network troubleshooting',
        'switches': 'Switch port configuration',
        'cabling': 'Cable routing and organization',
        'power-systems': 'Network power distribution',
        'troubleshooting': 'Multi-system diagnostic expert'
      }
    },
    { 
      id: 'tech-6', 
      name: 'Lisa Wang', 
      team: 'compute', 
      available: true,
      expertise: ['gpu', 'nvidia', 'v100', 'a100', 'h100', 'nvl72', 'high-density'],
      experience: 8,
      rating: 5.0,
      specialties: {
        'nvl72': 'NVL72 rack specialist',
        'high-density': 'High-density compute deployments',
        'a100': 'A100 cluster management expert',
        'h100': 'H100 system optimization',
        'gpu': 'Advanced GPU troubleshooting',
        'nvidia': 'NVIDIA architecture specialist'
      }
    },
  ]

  // Extract required skills from work order description - more diverse and context-aware
  const extractRequiredSkills = (workOrder) => {
    if (!workOrder) return []
    
    const text = `${workOrder.title || ''} ${workOrder.description || ''} ${workOrder.model || ''}`.toLowerCase()
    const skills = []
    
    // GPU/Compute specific - only if explicitly mentioned
    if (text.match(/\b(gpu|graphics|nvidia|a100|h100|v100|nvl72|tensor|compute node)\b/)) {
      if (text.includes('a100')) {
        skills.push('a100', 'nvidia', 'gpu')
      } else if (text.includes('h100')) {
        skills.push('h100', 'nvidia', 'gpu')
      } else if (text.includes('nvl72')) {
        skills.push('nvl72', 'high-density', 'gpu')
      } else if (text.includes('gpu') || text.includes('graphics')) {
        skills.push('gpu')
        if (text.includes('nvidia')) skills.push('nvidia')
      }
    }
    
    // Network infrastructure - only if network-related
    if (text.match(/\b(switch|router|network|cable|fiber|ethernet|port|link|connectivity|routing)\b/)) {
      if (text.includes('switch')) {
        skills.push('switches', 'networking')
      } else if (text.includes('router')) {
        skills.push('routers', 'networking')
      } else if (text.includes('cable') || text.includes('fiber')) {
        skills.push('cabling', 'fiber')
      } else {
        skills.push('networking')
      }
    }
    
    // Storage systems - only if storage-related
    if (text.match(/\b(storage|disk|ssd|raid|drive|backup|array|volume|san|nas)\b/)) {
      if (text.includes('raid')) {
        skills.push('raid', 'storage')
      } else if (text.includes('ssd')) {
        skills.push('ssd', 'storage')
      } else if (text.includes('disk') || text.includes('drive')) {
        skills.push('disks', 'storage')
      } else {
        skills.push('storage')
      }
    }
    
    // Power systems - only if power-related
    if (text.match(/\b(psu|power supply|electrical|voltage|amperage|breaker|circuit|power distribution)\b/)) {
      skills.push('power-systems')
      if (text.includes('psu') || text.includes('power supply')) {
        skills.push('psu-replacement')
      }
    }
    
    // Cooling/Thermal - only if temperature-related
    if (text.match(/\b(cooling|thermal|temperature|fan|coolant|chiller|hvac|airflow|ventilation)\b/)) {
      if (text.includes('temperature') || text.includes('thermal')) {
        skills.push('thermal-management', 'cooling')
      } else if (text.includes('fan') || text.includes('cooling')) {
        skills.push('cooling')
      }
    }
    
    // Cabling and physical infrastructure
    if (text.match(/\b(cable|wiring|patch|connector|splice|termination)\b/) && !text.includes('network')) {
      skills.push('cabling', 'physical-infrastructure')
    }
    
    // Software/Configuration tasks
    if (text.match(/\b(config|configure|setup|install|firmware|bios|os|software)\b/)) {
      skills.push('configuration', 'software')
    }
    
    // Diagnostic/Troubleshooting
    if (text.match(/\b(diagnose|troubleshoot|debug|test|verify|check|inspect)\b/)) {
      skills.push('troubleshooting', 'diagnostics')
    }
    
    // Physical repair/replacement
    if (text.match(/\b(replace|repair|fix|install|remove|mount|unmount)\b/)) {
      skills.push('hardware-repair')
    }
    
    // High-density or specialized racks
    if (text.match(/\b(high.density|nvl72|dense|compact|specialized)\b/)) {
      skills.push('high-density')
    }
    
    // Team-based skills (only if no specific skills found)
    if (skills.length === 0 && workOrder.team) {
      if (workOrder.team === 'compute') skills.push('compute')
      if (workOrder.team === 'network') skills.push('networking')
      if (workOrder.team === 'storage') skills.push('storage')
    }
    
    return [...new Set(skills)] // Remove duplicates
  }

  // Get all buzzwords/keywords to highlight
  const getBuzzwords = (workOrder) => {
    if (!workOrder) return []
    
    const allSkills = extractRequiredSkills(workOrder)
    const buzzwords = []
    
    // Add all skill-related keywords
    allSkills.forEach(skill => {
      buzzwords.push(skill)
      // Add variations
      if (skill === 'gpu') buzzwords.push('GPU', 'graphics')
      if (skill === 'nvidia') buzzwords.push('NVIDIA', 'Nvidia')
      if (skill === 'a100') buzzwords.push('A100')
      if (skill === 'h100') buzzwords.push('H100')
      if (skill === 'nvl72') buzzwords.push('NVL72', 'NVL-72')
      if (skill === 'networking') buzzwords.push('network', 'Network')
      if (skill === 'switches') buzzwords.push('switch', 'Switch')
      if (skill === 'cabling') buzzwords.push('cable', 'Cable', 'cables')
      if (skill === 'storage') buzzwords.push('Storage', 'disk', 'Disk')
      if (skill === 'power-systems') buzzwords.push('PSU', 'psu', 'power', 'Power')
      if (skill === 'cooling') buzzwords.push('Cooling', 'thermal', 'Thermal')
    })
    
    // Add common technical terms
    const commonTerms = ['rack', 'Rack', 'pod', 'Pod', 'aisle', 'Aisle', 'server', 'Server', 'node', 'Node']
    buzzwords.push(...commonTerms)
    
    return [...new Set(buzzwords)]
  }

  // Highlight buzzwords in text
  const highlightBuzzwords = (text, buzzwords) => {
    if (!text || !buzzwords || buzzwords.length === 0) {
      return [{ text: text || '', highlight: false }]
    }
    
    // Sort buzzwords by length (longest first) to match longer phrases first
    const sortedBuzzwords = [...buzzwords].filter(w => w && w.length > 0).sort((a, b) => b.length - a.length)
    
    if (sortedBuzzwords.length === 0) {
      return [{ text, highlight: false }]
    }
    
    // Create regex pattern that matches whole words only
    const escapedBuzzwords = sortedBuzzwords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const pattern = new RegExp(
      `\\b(${escapedBuzzwords.join('|')})\\b`,
      'gi'
    )
    
    const parts = []
    let lastIndex = 0
    let match
    
    // Reset regex
    pattern.lastIndex = 0
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index), highlight: false })
      }
      
      // Add highlighted match
      parts.push({ text: match[0], highlight: true })
      lastIndex = pattern.lastIndex
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), highlight: false })
    }
    
    return parts.length > 0 ? parts : [{ text, highlight: false }]
  }

  // Calculate match score for a technician
  const calculateMatchScore = (technician, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) return 0
    
    const techSkills = technician.expertise || []
    const matchingSkills = requiredSkills.filter(skill => 
      techSkills.some(techSkill => 
        techSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(techSkill.toLowerCase())
      )
    )
    
    const baseScore = (matchingSkills.length / requiredSkills.length) * 100
    
    // Bonus for experience and rating
    const experienceBonus = Math.min(technician.experience || 0, 10) * 2
    const ratingBonus = ((technician.rating || 0) - 4) * 10
    
    return Math.min(100, baseScore + experienceBonus + ratingBonus)
  }

  // Get match quality label
  const getMatchLabel = (score) => {
    if (score >= 80) return { label: 'Best Match', color: 'success' }
    if (score >= 60) return { label: 'Good Match', color: 'accent' }
    if (score >= 40) return { label: 'Fair Match', color: 'warning' }
    return { label: 'Low Match', color: 'text-tertiary' }
  }

  // Get task-specific expertise reasons for a technician
  const getTaskSpecificReasons = (tech, requiredSkills, workOrder) => {
    if (!workOrder || !requiredSkills || requiredSkills.length === 0) return []
    
    const reasons = []
    const text = `${workOrder.title || ''} ${workOrder.description || ''}`.toLowerCase()
    
    // Check each matching skill and get the specialty description
    requiredSkills.forEach(skill => {
      if (tech.expertise.some(techSkill => 
        techSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(techSkill.toLowerCase())
      )) {
        // Find the best matching specialty
        const matchingSpecialty = Object.keys(tech.specialties || {}).find(spec => {
          const specLower = spec.toLowerCase()
          const skillLower = skill.toLowerCase()
          return specLower.includes(skillLower) || skillLower.includes(specLower) ||
                 text.includes(specLower) || text.includes(skillLower)
        })
        
        if (matchingSpecialty && tech.specialties[matchingSpecialty]) {
          reasons.push(tech.specialties[matchingSpecialty])
        } else if (tech.specialties[skill]) {
          reasons.push(tech.specialties[skill])
        }
      }
    })
    
    // Add context-specific reasons based on work order content
    if (text.includes('temperature') || text.includes('cooling') || text.includes('thermal')) {
      if (tech.expertise.includes('cooling') || tech.expertise.includes('thermal-management')) {
        if (!reasons.some(r => r.toLowerCase().includes('cooling') || r.toLowerCase().includes('thermal'))) {
          reasons.push(`${tech.name} specializes in temperature controls and thermal management`)
        }
      }
    }
    
    if (text.includes('nvl72') || text.includes('high-density')) {
      if (tech.expertise.includes('nvl72') || tech.expertise.includes('high-density')) {
        if (!reasons.some(r => r.toLowerCase().includes('nvl72') || r.toLowerCase().includes('high-density'))) {
          reasons.push(`${tech.name} is an expert in high-density NVL72 rack systems`)
        }
      }
    }
    
    if (text.includes('power') || text.includes('psu') || text.includes('electrical')) {
      if (tech.expertise.includes('power-systems')) {
        if (!reasons.some(r => r.toLowerCase().includes('power'))) {
          reasons.push(`${tech.name} has extensive experience with power systems`)
        }
      }
    }
    
    if (text.includes('network') || text.includes('switch') || text.includes('cable')) {
      if (tech.expertise.includes('networking') || tech.expertise.includes('switches') || tech.expertise.includes('cabling')) {
        if (!reasons.some(r => r.toLowerCase().includes('network') || r.toLowerCase().includes('switch'))) {
          reasons.push(`${tech.name} excels at network infrastructure work`)
        }
      }
    }
    
    // Remove duplicates and return top 3 most relevant
    return [...new Set(reasons)].slice(0, 3)
  }

  // Calculate matches and sort technicians
  const techniciansWithMatches = useMemo(() => {
    const requiredSkills = extractRequiredSkills(workOrder)
    
    return technicians.map(tech => {
      const matchScore = calculateMatchScore(tech, requiredSkills)
      const matchInfo = getMatchLabel(matchScore)
      const matchingSkills = requiredSkills.filter(skill => 
        tech.expertise.some(techSkill => 
          techSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(techSkill.toLowerCase())
        )
      )
      const taskReasons = getTaskSpecificReasons(tech, requiredSkills, workOrder)
      
      return {
        ...tech,
        matchScore,
        matchLabel: matchInfo.label,
        matchColor: matchInfo.color,
        requiredSkills,
        matchingSkills,
        taskReasons
      }
    }).sort((a, b) => {
      // Sort by: available first, then by match score
      if (a.available !== b.available) return b.available - a.available
      return b.matchScore - a.matchScore
    })
  }, [workOrder])

  const handleAssign = async () => {
    if (!selectedTechnician) return
    
    setLoading(true)
    try {
      await onAssign(workOrder.id, selectedTechnician)
      onClose()
    } catch (err) {
      console.error('Error assigning work order:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-bg-elevated rounded-lg border border-border shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-h1 text-text-primary">Assign Work Order</h2>
              <button
                onClick={onClose}
                className="p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {workOrder && (
              <p className="text-sm text-text-secondary mt-2">
                {workOrder.title} • {workOrder.rack}
              </p>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Work Order Details with Highlighted Buzzwords */}
            {workOrder && (() => {
              const buzzwords = getBuzzwords(workOrder)
              const workOrderText = `${workOrder.title || ''}${workOrder.description ? ` - ${workOrder.description}` : ''}${workOrder.model ? ` (${workOrder.model})` : ''}`
              const highlightedParts = highlightBuzzwords(workOrderText, buzzwords)
              
              return (
                <div className="p-3 bg-bg-secondary rounded-lg border border-border">
                  <p className="text-xs font-medium text-text-secondary mb-2">Work Order Details:</p>
                  <div className="text-sm text-text-primary leading-relaxed">
                    {highlightedParts.map((part, idx) => (
                      <span
                        key={idx}
                        className={part.highlight ? 'bg-accent-100 dark:bg-accent-50 text-accent-700 dark:text-accent-600 font-medium px-1 rounded' : ''}
                      >
                        {part.text}
                      </span>
                    ))}
                  </div>
                  {buzzwords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-medium text-text-secondary mb-1.5">Key Requirements:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {techniciansWithMatches[0]?.requiredSkills?.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-xs bg-accent-50 dark:bg-accent-50 text-accent-600 dark:text-accent-500 rounded border border-accent-200 dark:border-accent-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Technician {techniciansWithMatches[0]?.matchScore > 0 && '(Sorted by Match)'}
              </label>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {techniciansWithMatches.map((tech) => {
                  const matchColorClasses = {
                    success: 'bg-success-50 dark:bg-success-50 border-success-200 dark:border-success-200 text-success-600 dark:text-success-500',
                    accent: 'bg-accent-50 dark:bg-accent-50 border-accent-200 dark:border-accent-200 text-accent-600 dark:text-accent-500',
                    warning: 'bg-warning-50 dark:bg-warning-50 border-warning-200 dark:border-warning-200 text-warning-600 dark:text-warning-500',
                    'text-tertiary': 'bg-bg-tertiary border-border text-text-tertiary'
                  }
                  
                  return (
                    <motion.button
                      key={tech.id}
                      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => tech.available && setSelectedTechnician(tech.id)}
                      disabled={!tech.available}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedTechnician === tech.id
                          ? 'border-accent-500 bg-accent-50 dark:bg-accent-50 shadow-sm'
                          : tech.available
                          ? 'border-border bg-bg-secondary hover:bg-bg-tertiary hover:shadow-sm'
                          : 'border-border bg-bg-tertiary opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                            {tech.matchScore > 0 && tech.available && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${matchColorClasses[tech.matchColor]}`}>
                                {tech.matchLabel} ({Math.round(tech.matchScore)}%)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary capitalize mb-2">
                            {tech.team} Team • {tech.experience} years exp • Rating: {tech.rating}
                          </p>
                          
                          {/* Task-Specific Reasons */}
                          {tech.taskReasons && tech.taskReasons.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              <p className="text-xs font-medium text-text-secondary">Why {tech.name.split(' ')[0]} is a good fit:</p>
                              {tech.taskReasons.map((reason, idx) => (
                                <div key={idx} className="flex items-start gap-1.5">
                                  <svg className="w-3.5 h-3.5 text-success-500 dark:text-success-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <p className="text-xs text-text-primary leading-relaxed">{reason}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Matching Skills (Secondary Info) */}
                          {tech.matchingSkills && tech.matchingSkills.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs text-text-tertiary mb-1">Relevant expertise:</p>
                              <div className="flex flex-wrap gap-1">
                                {tech.matchingSkills.slice(0, 5).map((skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 text-xs bg-bg-tertiary text-text-secondary rounded"
                                  >
                                    {skill}
                                  </span>
                                ))}
                                {tech.matchingSkills.length > 5 && (
                                  <span className="px-1.5 py-0.5 text-xs text-text-tertiary">
                                    +{tech.matchingSkills.length - 5}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Missing Skills Warning */}
                          {tech.matchScore < 60 && tech.available && (
                            <p className="text-xs text-warning-500 dark:text-warning-400 mt-2">
                              Warning: Some required skills may be missing
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {!tech.available && (
                            <span className="text-xs text-text-tertiary">Unavailable</span>
                          )}
                          {selectedTechnician === tech.id && (
                            <svg className="w-5 h-5 text-accent-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <PrimaryButton
                type="button"
                onClick={onClose}
                variant="ghost"
                disabled={loading}
              >
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={handleAssign}
                variant="primary"
                disabled={loading || !selectedTechnician}
              >
                {loading ? 'Assigning...' : 'Assign Work Order'}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default WorkOrderAssignment

