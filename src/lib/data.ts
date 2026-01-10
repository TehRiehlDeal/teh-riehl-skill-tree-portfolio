export interface TreeNode {
	id: string;
	label: string;
	description: string;
	x: number;
	y: number;
	parentId: string | null;  // null means it's the root or connects to center
	category: 'origin' | 'experience' | 'projects' | 'skills' | 'education';
	size: 'x-large' | 'large' | 'medium' | 'small';
    icon?: string;

    // ========== EXPERIENCE-SPECIFIC FIELDS ==========
	company?: string;
	jobTitle?: string;
	startDate?: string;
	endDate?: string;  // Use "Present" for current role
	highlights?: string[];  // Key achievements or responsibilities

	// ========== PROJECT-SPECIFIC FIELDS ==========
	techStack?: string[];
	projectUrl?: string;
	repoUrl?: string;

	// ========== SKILL-SPECIFIC FIELDS ==========
	proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
	yearsOfExperience?: number;

	// ========== EDUCATION-SPECIFIC FIELDS ==========
	institution?: string;
	degree?: string;
	field?: string;
	graduationYear?: string;

    // ========== ORIGIN-SPECIFIC FIELDS ==========
	fullName?: string;
	aboutMe?: string;
	location?: string;
	email?: string;
	linkedIn?: string;
	github?: string;
	website?: string;
}

// The center of our tree is at (0, 0)
// Positive X = right, Negative X = left
// Positive Y = down, Negative Y = up

export const treeNodes: TreeNode[] = [
	// ========== ORIGIN (Center) ==========
	{
		id: 'origin',
		label: 'Kevin Riehl',
		description: 'Welcome to my skill tree! Click on nodes to explore my experience, projects, and skills.',
		x: 0,
		y: 0,
		parentId: null,
		category: 'origin',
		size: 'x-large',
		icon: '',
		fullName: 'Kevin Riehl',
		jobTitle: 'Software Development - Lead Associate',
		aboutMe: 'Intermediate Software Engineer with 5+ years of experience architecting full-stack applications using React, Node.js (Hapi), and SQL. Expertise includes modernizing legacy codebases, implementing rigorous testing standards, and leading frontend architecture improvements. passionate about leveraging modern tools like ShadCN and Docker to streamline development workflows.',
		location: 'Kent, WA',
		email: 'kevinriehl@gmail.com',
		linkedIn: 'https://www.linkedin.com/in/kevinriehl',
		github: 'https://github.com/TehRiehlDeal',
		website: 'https://tehriehldeal.com',
	},

	// ========== EXPERIENCE (Top Right Quadrant) ==========
	{
		id: 'exp-branch',
		label: 'Experience',
		description: 'My professional journey.',
		x: 150,
		y: -100,
		parentId: 'origin',
		category: 'experience',
		size: 'large',
        icon: '/icons/experience.svg'
	},
	{
		id: 'exp-job1',
		label: 'Software Engineer',
		description: 'Junior developer at the start of my career.',
		x: 212,
		y: -191,
		parentId: 'exp-branch',
		category: 'experience',
		size: 'small',
        icon: '/icons/insightglobal.webp',
        company: 'Insight Global',
        jobTitle: 'Software Engineer',
        startDate: 'October 2020',
        endDate: 'April 2021',
        highlights: [
            'Refactored legacy PHP endpoints into a robust Hapi.js architecture, aligning the project with modern JavaScript standards and improving API response times',
            'Executed a critical database migration from MySQL to MSSQL, ensuring data integrity during the transfer and optimizing schema definitions for the new environment'
        ]
	},
	{
		id: 'exp-job2',
		label: 'Software Engineer',
		description: 'Slightly more experienced still early in my career.',
		x: 337,
		y: -191,
		parentId: 'exp-job1',
		category: 'experience',
		size: 'small',
        icon: '/icons/bluewater.png',
        jobTitle: 'Software Engineer',
        startDate: 'April 2021',
        endDate: 'February 2024',
        highlights: [
            'Architected and built a comprehensive data analytics search engine using React and Hapi.js (TypeScript), enabling users to filter complex event datasets by location, type, and date for real-time analysis',
            'Facilitated successful production releases by managing SQL database migration scripts and executing rigorous regression testing to ensure critical features remained stable during updates',
            'Supported engineering team growth by conducting code reviews and leading the onboarding process for new developers, ensuring smooth knowledge transfer and adherence to coding standards'
        ]
	},
	{
		id: 'exp-job3',
		label: 'Intermediate Software Engineer',
		description: 'Slightly more experienced.',
		x: 400,
		y: -100,
		parentId: 'exp-job2',
		category: 'experience',
		size: 'small',
        icon: '/icons/sempervalens.png',
        jobTitle: 'Intermediate Software Engineer',
        startDate: 'February 2024',
        endDate: 'June 2025',
        highlights: [
            "Championed the adoption of ShadCN by conducting a live technical demonstration on the team's starter template, proving the framework's ability to accelerate development velocity and ensure UI consistency across projects",
            "Developed a Web Bluetooth interface for a biometric monitoring proof-of-concept, enabling real-time data ingestion and aggregation from multiple wearable sensors (accelerometers and smartwatches) for sleep analysis",
            "Supported the engineering team’s migration to containerized workflows by configuring, testing, and troubleshooting custom Docker environments, ensuring consistent application behavior across development and production"
        ]
	},
	{
		id: 'exp-job4',
		label: 'Intermediate Software Engineer',
		description: 'Where one journey ends, another begins.',
		x: 337,
		y: -8,
		parentId: 'exp-job3',
		category: 'experience',
		size: 'small',
        icon: '/icons/chenega.jpg',
        jobTitle: "Intermediate Software Engineer",
        startDate: 'June 2025',
        endDate: 'January 2026',
        highlights: [
            'Architected a secure telehealth video conferencing application using React and WebRTC, designing the core signaling class to manage complex peer-to-peer connections (SDP offers/answers) and media stream constraints',
            'Implemented Google MediaPipe to develop a real-time gesture recognition feature, enabling accessibility for speech-impaired users by translating hand signs (e.g., thumbs up) into animated in-chat reactions',
            'Engineered adaptive network logic that monitors packet loss in real-time and dynamically adjusts video stream quality, ensuring connection stability and optimal user experience during bandwidth fluctuations'
        ]
	},
	{
		id: 'exp-job5',
		label: 'Lead Associate',
		description: 'Where I am now.',
		x: 212,
		y: -8,
		parentId: 'exp-job4',
		category: 'experience',
		size: 'small',
        icon: '/icons/peraton.png',
        jobTitle: 'Lead Associate',
        startDate: 'January 2026',
        endDate: 'Present',
        highlights: [
            'The Journey has just begun'
        ]
	},

	// ========== PROJECTS (Top Left Quadrant) ==========
	{
		id: 'proj-branch',
		label: 'Projects',
		description: 'Things I have built.',
		x: -150,
		y: -100,
		parentId: 'origin',
		category: 'projects',
		size: 'large',
	},
	{
		id: 'proj-1',
		label: 'Portfolio Site',
		description: 'This very skill tree you are exploring right now!',
		x: -300,
		y: -180,
		parentId: 'proj-branch',
		category: 'projects',
		size: 'small',
	},
	{
		id: 'proj-2',
		label: 'Side Project',
		description: 'A passion project I built to learn new technologies.',
		x: -320,
		y: -80,
		parentId: 'proj-branch',
		category: 'projects',
		size: 'small',
	},

	// ========== SKILLS (Bottom Right Quadrant) ==========
	{
		id: 'skills-branch',
		label: 'Skills',
		description: 'Technologies and abilities I have acquired.',
		x: 150,
		y: 100,
		parentId: 'origin',
		category: 'skills',
		size: 'large',
        icon: '/icons/skills.svg'
	},
	{
		id: 'skill-js',
		label: 'JavaScript',
		description: 'Core language of the web. Proficient in modern ES6+ features.',
		x: 280,
		y: 60,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'medium',
        icon: '/icons/javascript.png',
	},
	{
		id: 'skill-ts',
		label: 'TypeScript',
		description: 'Type-safe JavaScript. My preferred way to write code.',
		x: 320,
		y: 140,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'small',
        icon: '/icons/typescript.png'
	},
	{
		id: 'skill-svelte',
		label: 'Svelte',
		description: 'The framework powering this portfolio!',
		x: 260,
		y: 200,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'small',
	},

	// ========== EDUCATION (Bottom Left Quadrant) ==========
	{
		id: 'edu-branch',
		label: 'Education',
		description: 'Where I learned the fundamentals.',
		x: -150,
		y: 100,
		parentId: 'origin',
		category: 'education',
		size: 'large',
	},
	{
		id: 'edu-degree',
		label: 'University',
		description: 'Bachelor\'s degree in Computer Science.',
		x: -300,
		y: 80,
		parentId: 'edu-branch',
		category: 'education',
		size: 'small',
	},
	{
		id: 'edu-cert',
		label: 'Certifications',
		description: 'Additional certifications and courses completed.',
		x: -280,
		y: 180,
		parentId: 'edu-branch',
		category: 'education',
		size: 'small',
	},
];

// Colors for each category (PoE-inspired)
export const categoryColors: Record<TreeNode['category'], number> = {
	origin: 0xffd700,      // Gold
	experience: 0x4ecdc4,  // Teal
	projects: 0xff6b6b,    // Coral red
	skills: 0x95e1d3,      // Mint green
	education: 0xdda0dd,   // Plum purple
};