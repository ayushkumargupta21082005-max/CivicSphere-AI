import { CivicIssue, SeverityType, StatusType } from '../types';

/**
 * Smart Priority Engine: Calculates 0-100 priority score based on multiple factors.
 */
export function calculatePriorityScore(issue: {
  severity: SeverityType;
  ward: string;
  duplicateCount: number;
  emergencyEscalation: boolean;
  affectedPopulationEstimate?: number; // e.g. number of people
  openDays?: number;
}): number {
  let score = 0;

  // 1. Severity Baseline (Max 40 points)
  switch (issue.severity) {
    case 'Emergency': score += 40; break;
    case 'High': score += 30; break;
    case 'Medium': score += 20; break;
    case 'Low': score += 10; break;
  }

  // 2. Ward Baseline Risk (Max 15 points)
  // Wards with older infrastructure or high-population density get slightly higher priority
  if (issue.ward === 'Ward 3' || issue.ward === 'Ward 5') {
    score += 15;
  } else if (issue.ward === 'Ward 2') {
    score += 10;
  } else {
    score += 5;
  }

  // 3. Duplicate and Repeat Reports (Max 15 points)
  score += Math.min(issue.duplicateCount * 3, 15);

  // 4. Time Open Factor (Max 15 points)
  const days = issue.openDays || 0;
  score += Math.min(days * 1.5, 15);

  // 5. Emergency Escalation (Max 15 points)
  if (issue.emergencyEscalation) {
    score += 15;
  }

  // Cap score at 100 and floor it
  return Math.max(0, Math.min(100, Math.floor(score)));
}

/**
 * Duplicate Merge Suggestion: Finds matching categories in the same ward.
 */
export function findDuplicateSuggestions(
  currentIssue: { category: string; ward: string; id?: string },
  allIssues: CivicIssue[]
): CivicIssue[] {
  return allIssues.filter(
    issue =>
      issue.id !== currentIssue.id &&
      issue.status !== 'Resolved' &&
      issue.status !== 'Rejected' &&
      issue.category.toLowerCase() === currentIssue.category.toLowerCase() &&
      issue.ward === currentIssue.ward
  );
}

/**
 * Generate a realistic initial list of issues for demonstration.
 */
export function getInitialIssues(): CivicIssue[] {
  const initial: Omit<CivicIssue, 'priorityScore'>[] = [
    {
      id: 'issue-101',
      title: 'Major Sewer Overflow on Main St',
      description: 'Sewage water leaking from manhole on Main Street near the local library, causing major odor and pedestrian traffic detour. It has been flowing for over 12 hours.',
      category: 'Sewage',
      severity: 'Emergency',
      status: 'In Progress',
      ward: 'Ward 3',
      reporterName: 'Carlos Santas',
      reporterEmail: 'carlos.s@gmail.com',
      image: undefined,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      assignedDepartment: 'Water & Sewer Authority',
      location: {
        address: '412 Main Street, Civic Center',
        lat: 37.7749,
        lng: -122.4194
      },
      comments: [
        {
          id: 'c1',
          author: 'System',
          role: 'system',
          text: 'AI Smart Engine routed report to Water & Sewer Authority with confidence level 98%.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 1000).toISOString()
        },
        {
          id: 'c2',
          author: 'Director Davis',
          role: 'official',
          text: 'Dispatch crew has been sent to block the leak. Excavation required to fix the main gasket.',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      timeline: [
        {
          id: 't1',
          status: 'Submitted',
          description: 'Citizen filed report via web portal.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Carlos Santas'
        },
        {
          id: 't2',
          status: 'In Progress',
          description: 'Water & Sewer team dispatched. Excavation crew working on bypass pipes.',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Director Davis'
        }
      ],
      isDuplicate: false,
      duplicateOf: null,
      duplicateCount: 2,
      citizenReputationScore: 85,
      aiConfidence: 98,
      hazards: ['Biological Health Risk', "Water contamination", "Pedestrian biohazard slip risk"],
      citizenAdvisory: 'Avoid walking near the library manholes. Do not permit children or pets near flowing surface water.',
      governmentInsights: 'Immediate crew response active. Ward 3 mainline is showing accelerated wear due to local pipe age (45+ years). Plan preventive lining replacement for Q4.',
      emergencyEscalation: true,
      impactEstimation: '150+ commercial and library properties water service temporarily throttled.'
    },
    {
      id: 'issue-102',
      title: 'Pothole on 5th Ave Crossing',
      description: 'Extremely deep pothole in the middle of 5th Ave right before the intersection. Multiple cars have had to swerve suddenly, causing dangerous lane changes.',
      category: 'Road Damage',
      severity: 'High',
      status: 'Submitted',
      ward: 'Ward 1',
      reporterName: 'Sarah Jenkins',
      reporterEmail: 'sarah.j@outlook.com',
      image: undefined,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      assignedDepartment: 'Department of Public Works',
      location: {
        address: '5th Ave & Pine Street, North Ward',
        lat: 37.7833,
        lng: -122.4167
      },
      comments: [
        {
          id: 'c3',
          author: 'System',
          role: 'system',
          text: 'AI Smart Engine analyzed the report. Categorized as Road Damage. Routed to Department of Public Works.',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000 + 500).toISOString()
        }
      ],
      timeline: [
        {
          id: 't3',
          status: 'Submitted',
          description: 'Citizen report submitted and validated by Smart Priority Engine.',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Sarah Jenkins'
        }
      ],
      isDuplicate: false,
      duplicateOf: null,
      duplicateCount: 0,
      citizenReputationScore: 120,
      aiConfidence: 94,
      hazards: ['Vehicle tire/wheel damage risk', 'Sudden swerving traffic collision hazard'],
      citizenAdvisory: 'Slow down when crossing Pine Street on 5th Ave. Keep to the right lane where possible.',
      governmentInsights: 'Highly traveled arterial road. Public Works patch crew scheduled for next standard morning sweep.',
      emergencyEscalation: false,
      impactEstimation: '500+ daily commuter vehicles are exposed to damage at this crossing.'
    },
    {
      id: 'issue-103',
      title: 'Unlit block near Community Garden',
      description: 'Three consecutive streetlights are broken. The block is completely dark. Kids walk home through here from school and it feels very unsafe.',
      category: 'Broken Streetlights',
      severity: 'Medium',
      status: 'In Progress',
      ward: 'Ward 5',
      reporterName: 'Marcus Vance',
      reporterEmail: 'marcus.v@yahoo.com',
      image: undefined,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      assignedDepartment: 'Electrical Department',
      location: {
        address: '740 Garden Parkway, Ward 5 East',
        lat: 37.7699,
        lng: -122.4468
      },
      comments: [
        {
          id: 'c4',
          author: 'System',
          role: 'system',
          text: 'Auto-routed report. High dark-block vulnerability identified for Ward 5.',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 1000).toISOString()
        },
        {
          id: 'c5',
          author: 'Engineer Chen',
          role: 'official',
          text: 'Work order dispatched to electrical maintenance van. Ballasts and photocell are being replaced.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      timeline: [
        {
          id: 't4',
          status: 'Submitted',
          description: 'Citizen report received.',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Marcus Vance'
        },
        {
          id: 't5',
          status: 'In Progress',
          description: 'Electrical team assigned. Order listed as active queue.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Engineer Chen'
        }
      ],
      isDuplicate: false,
      duplicateOf: null,
      duplicateCount: 1,
      citizenReputationScore: 90,
      aiConfidence: 91,
      hazards: ['Increased crime susceptibility', 'Extremely low night visibility for pedestrians'],
      citizenAdvisory: 'Avoid traveling on foot through the Garden Parkway blocks after sunset. Use lighted bypass streets.',
      governmentInsights: 'Older high-pressure sodium bulbs on Garden Parkway are failing. Plan upgrade to LED lamps.',
      emergencyEscalation: false,
      impactEstimation: '35 local families and community center children affected daily.'
    },
    {
      id: 'issue-104',
      title: 'Illegal dumping behind local supermarket',
      description: 'Huge pile of discarded tires, construction scraps, and old electronics dumped behind the supermarket loading dock. Blocked storm runoffs.',
      category: 'Illegal Dumping',
      severity: 'Medium',
      status: 'Submitted',
      ward: 'Ward 2',
      reporterName: 'Leila Faris',
      reporterEmail: 'lfaris@me.com',
      image: undefined,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      assignedDepartment: 'Sanitation Services',
      location: {
        address: '900 Plaza Way, Retail Hub',
        lat: 37.7542,
        lng: -122.4211
      },
      comments: [
        {
          id: 'c6',
          author: 'System',
          role: 'system',
          text: 'Identified Potential Illegal Dumping. Auto-assigned to Sanitation Services.',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000 + 400).toISOString()
        }
      ],
      timeline: [
        {
          id: 't6',
          status: 'Submitted',
          description: 'Citizen submission validated.',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedBy: 'Leila Faris'
        }
      ],
      isDuplicate: false,
      duplicateOf: null,
      duplicateCount: 0,
      citizenReputationScore: 45,
      aiConfidence: 89,
      hazards: ['Rodent nesting ground hazard', 'Heavy metal/chemical runoff risk from electronics', 'Clogged stormwater pathways'],
      citizenAdvisory: 'Keep clear of discarded tires and hazardous electronics. Do not try to move them yourself.',
      governmentInsights: 'Dumping on private commercial property adjacent to public drains. Sanitation must issue violation notice and clear public block paths.',
      emergencyEscalation: false,
      impactEstimation: 'Immediate neighboring commercial properties and local storm drains affected.'
    }
  ];

  // Map to include calculated priority scores
  return initial.map(item => {
    // Determine open days
    const created = new Date(item.createdAt);
    const diffTime = Math.abs(Date.now() - created.getTime());
    const openDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const score = calculatePriorityScore({
      severity: item.severity,
      ward: item.ward,
      duplicateCount: item.duplicateCount,
      emergencyEscalation: item.emergencyEscalation,
      openDays
    });

    return {
      ...item,
      priorityScore: score
    } as CivicIssue;
  });
}
