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

	// ========== CONTRACT-SPECIFIC FIELDS ==========
	contractName?: string;
	client?: string;
	contractStart?: string;
	contractEnd?: string;

	// ========== PROJECT-SPECIFIC FIELDS (extended) ==========
	techStack?: string[];
	projectUrl?: string;
	repoUrl?: string;
	npmUrl?: string;        // For npm packages
	pypiUrl?: string;       // For PyPI packages
	downloads?: string;     // "1,000+ downloads"
	stars?: number;         // GitHub stars
	status?: 'active' | 'maintained' | 'archived' | 'completed';

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
	resumeUrl?: string;
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
		aboutMe: 'Intermediate Software Engineer with 5+ years of experience architecting full-stack applications using React, Node.js (Hapi), and SQL. Expertise includes modernizing legacy codebases, implementing rigorous testing standards, and leading frontend architecture improvements. Passionate about leveraging modern tools like ShadCN and Docker to streamline development workflows.',
		location: 'Kent, WA',
		email: 'kevinriehl@gmail.com',
		linkedIn: 'https://www.linkedin.com/in/kevinriehl',
		github: 'https://github.com/TehRiehlDeal',
		website: 'https://tehriehldeal.com',
		resumeUrl: '/kevin-riehl-resume.pdf',
	},

	// ========== EXPERIENCE (Upper Right - Contract-Based) ==========
	{
		id: 'exp-branch',
		label: 'Experience',
		description: 'My professional journey.',
		x: 200,
		y: -150,
		parentId: 'origin',
		category: 'experience',
		size: 'large',
		icon: '/icons/experience.svg',
	},
	
	// Contract Parent Node
	{
		id: 'exp-contract',
		label: 'DHA - Web and Mobile Technology',
		description: 'Continuous work supporting the same government client through multiple contracting companies as the contract was re-competed and awarded.',
		x: 320,
		y: -220,
		parentId: 'exp-branch',
		category: 'experience',
		size: 'medium',
		icon: '/icons/contract.svg',
		contractName: 'DHA WMT',
		client: 'Defense Health Agency',
		contractStart: 'October 2020',
		contractEnd: 'Present',
	},
	
	// Job 1 - First company (starting point of the arc)
	{
		id: 'exp-job1',
		label: 'Software Engineer',
		description: 'Junior developer at the start of my career.',
		x: 420,
		y: -280,
		parentId: 'exp-contract',
		category: 'experience',
		size: 'small',
		icon: '/icons/insightglobal.webp',
		company: 'Insight Global',
		jobTitle: 'Software Engineer',
		startDate: 'October 2020',
		endDate: 'April 2021',
		highlights: [
			'Refactored legacy PHP endpoints into a robust Hapi.js architecture, aligning the project with modern JavaScript standards and improving API response times',
			'Executed a critical database migration from MySQL to MSSQL, ensuring data integrity during the transfer and optimizing schema definitions for the new environment',
		],
	},
	
	// Job 2 - Arc continues upward
	{
		id: 'exp-job2',
		label: 'Software Engineer',
		description: 'Growing my skills and taking on more responsibility.',
		x: 500,
		y: -350,
		parentId: 'exp-job1',
		category: 'experience',
		size: 'small',
		icon: '/icons/bluewater.png',
		company: 'Bluewater Federal Solutions',
		jobTitle: 'Software Engineer',
		startDate: 'April 2021',
		endDate: 'February 2024',
		highlights: [
			'Architected and built a comprehensive data analytics search engine using React and Hapi.js (TypeScript), enabling users to filter complex event datasets by location, type, and date for real-time analysis',
			'Facilitated successful production releases by managing SQL database migration scripts and executing rigorous regression testing to ensure critical features remained stable during updates',
			'Supported engineering team growth by conducting code reviews and leading the onboarding process for new developers, ensuring smooth knowledge transfer and adherence to coding standards',
		],
	},
	
	// Job 3 - Peak of the arc
	{
		id: 'exp-job3',
		label: 'Intermediate Software Engineer',
		description: 'Stepping into a more senior role.',
		x: 560,
		y: -430,
		parentId: 'exp-job2',
		category: 'experience',
		size: 'small',
		icon: '/icons/sempervalens.png',
		company: 'Semper Valens Solutions',
		jobTitle: 'Intermediate Software Engineer',
		startDate: 'February 2024',
		endDate: 'June 2025',
		highlights: [
			"Championed the adoption of ShadCN by conducting a live technical demonstration on the team's starter template, proving the framework's ability to accelerate development velocity and ensure UI consistency across projects",
			'Developed a Web Bluetooth interface for a biometric monitoring proof-of-concept, enabling real-time data ingestion and aggregation from multiple wearable sensors (accelerometers and smartwatches) for sleep analysis',
			"Supported the engineering team's migration to containerized workflows by configuring, testing, and troubleshooting custom Docker environments, ensuring consistent application behavior across development and production",
		],
	},
	
	// Job 4 - Continuing upward and right
	{
		id: 'exp-job4',
		label: 'Intermediate Software Engineer',
		description: 'Where one journey ends, another begins.',
		x: 600,
		y: -510,
		parentId: 'exp-job3',
		category: 'experience',
		size: 'small',
		icon: '/icons/chenega.jpg',
		company: 'Chenega',
		jobTitle: 'Intermediate Software Engineer',
		startDate: 'June 2025',
		endDate: 'January 2026',
		highlights: [
			'Architected a secure telehealth video conferencing application using React and WebRTC, designing the core signaling class to manage complex peer-to-peer connections (SDP offers/answers) and media stream constraints',
			'Implemented Google MediaPipe to develop a real-time gesture recognition feature, enabling accessibility for speech-impaired users by translating hand signs (e.g., thumbs up) into animated in-chat reactions',
			'Engineered adaptive network logic that monitors packet loss in real-time and dynamically adjusts video stream quality, ensuring connection stability and optimal user experience during bandwidth fluctuations',
		],
	},
	
	// Job 5 - Current (highest point, prominent)
	{
		id: 'exp-job5',
		label: 'Lead Associate',
		description: 'Where I am now.',
		x: 620,
		y: -590,
		parentId: 'exp-job4',
		category: 'experience',
		size: 'medium',
		icon: '/icons/peraton.png',
		company: 'Peraton',
		jobTitle: 'Lead Associate',
		startDate: 'January 2026',
		endDate: 'Present',
		highlights: [
			'The journey has just begun',
		],
	},

	// ========== PROJECTS (Upper Left Quadrant) ==========
	{
		id: 'proj-branch',
		label: 'Projects',
		description: 'Personal projects and open-source contributions.',
		x: -200,
		y: -150,
		parentId: 'origin',
		category: 'projects',
		size: 'large',
		icon: '/icons/projects.svg',
	},

	// Open Source Libraries
	{
		id: 'proj-opensource',
		label: 'Open Source',
		description: 'Published packages and libraries available for the community.',
		x: -350,
		y: -220,
		parentId: 'proj-branch',
		category: 'projects',
		size: 'medium',
		icon: '/icons/opensource.svg',
	},

	// Personal Tools
	{
		id: 'proj-tools',
		label: 'Personal Tools',
		description: 'Applications built to solve real problems.',
		x: -350,
		y: -80,
		parentId: 'proj-branch',
		category: 'projects',
		size: 'medium',
		icon: '/icons/tools.svg',
	},

	// ========== OPEN SOURCE CHILDREN ==========
	{
		id: 'proj-tvdbapi',
		label: 'tvdbAPI',
		description: 'Python library for accessing The TVDB API. Fetch show info, episodes, actors, and images with a simple interface. Published on PyPI.',
		x: -420,
		y: -310,
		parentId: 'proj-opensource',
		category: 'projects',
		size: 'small',
		icon: '/icons/python.svg',
		techStack: ['Python', 'REST API', 'PyPI', 'GitHub Actions', 'Unit Testing'],
		repoUrl: 'https://github.com/TehRiehlDeal/TVDB-API',
		pypiUrl: 'https://pypi.org/project/tvdbAPI/',
		status: 'maintained'
	},
	{
		id: 'proj-tmdbapi',
		label: 'tmdbAPI',
		description: 'Python library for The Movie Database API. Search for movies, TV shows, actors, and collections with comprehensive query options.',
		x: -500,
		y: -250,
		parentId: 'proj-opensource',
		category: 'projects',
		size: 'small',
		icon: '/icons/python.svg',
		techStack: ['Python', 'REST API', 'PyPI', 'GitHub Actions', 'Unit Testing'],
		repoUrl: 'https://github.com/TehRiehlDeal/tmdbAPI',
		pypiUrl: 'https://pypi.org/project/tvdbAPI/',
		status: 'maintained'
	},

	// ========== PERSONAL TOOLS CHILDREN ==========
	{
		id: 'proj-renameshow',
		label: 'Rename Show',
		description: 'Desktop application for batch renaming TV show files using metadata from TVDB and TMDB. Features undo support, multi-episode detection, and automatic show searching.',
		x: -450,
		y: -130,
		parentId: 'proj-tools',
		category: 'projects',
		size: 'small',
		icon: '/icons/desktop.svg',
		techStack: ['Python', 'Tkinter', 'tvdbAPI', 'tmdbAPI', 'PIL'],
		repoUrl: 'https://github.com/TehRiehlDeal/python-file-rename',
	},
	{
		id: 'proj-portfolio',
		label: 'Skill Tree Portfolio',
		description: 'This interactive portfolio you\'re exploring right now! A Path of Exile inspired skill tree built with modern web technologies.',
		x: -450,
		y: -50,
		parentId: 'proj-tools',
		category: 'projects',
		size: 'small',
		icon: '/icons/svelte.svg',
		techStack: ['SvelteKit', 'TypeScript', 'PixiJS', 'GSAP', 'Tailwind CSS'],
		projectUrl: 'https://tehriehldeal.com',
		repoUrl: 'https://github.com/yourusername/skill-tree-portfolio',
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
		icon: '/icons/skills.svg',
	},

	// Concepts - upper right
	{
		id: 'concepts',
		label: 'Concepts',
		description: 'Core concepts I have learned throughout my career.',
		x: 350,
		y: -50,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'medium',
		icon: '/icons/concepts.svg',
	},

	// Tools & DevOps - moved up slightly
	{
		id: 'tools-devops',
		label: 'Tools & DevOps',
		description: 'The tools I use to get work done!',
		x: 450,
		y: 100,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'medium',
		icon: '/icons/devops.svg',
	},

	// Frontend - lower right
	{
		id: 'frontend',
		label: 'Frontend',
		description: 'The Frontend tools and frameworks I know!',
		x: 350,
		y: 350,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'medium',
		icon: '/icons/frontend.svg',
	},

	// Backend & Real-Time - pulled closer to Skills
	{
		id: 'backend-real-time',
		label: 'Backend & Real-Time',
		description: 'The Backend frameworks and concepts I know!',
		x: 150,
		y: 280,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'medium',
		icon: '/icons/backend.svg',
	},

	// Languages - left side
	{
		id: 'languages',
		label: 'Languages',
		description: 'The many languages I know!',
		x: -100,
		y: 280,
		parentId: 'skills-branch',
		category: 'skills',
		size: 'medium',
		icon: '/icons/languages.svg',
	},

	// ========== CONCEPTS CHILDREN (4) ==========
	{
		id: 'concept-oop',
		label: 'Object Oriented Programming',
		description: 'Object-Oriented Programming principles including encapsulation, inheritance, and polymorphism.',
		x: 380,
		y: -120,
		parentId: 'concepts',
		category: 'skills',
		size: 'small',
		icon: '/icons/oop.svg',
		proficiency: 'expert',
	},
	{
		id: 'concept-data-structure',
		label: 'Data Structures & Algorithms',
		description: 'Fundamental building blocks of efficient software—organizing data and solving problems with optimal time and space complexity.',
		x: 430,
		y: -75,
		parentId: 'concepts',
		category: 'skills',
		size: 'small',
		icon: '/icons/datastructure.svg',
		proficiency: 'advanced',
	},
	{
		id: 'concept-tdd',
		label: 'Test Driven Development',
		description: 'Unit testing, integration testing, and test-driven development practices.',
		x: 435,
		y: -20,
		parentId: 'concepts',
		category: 'skills',
		size: 'small',
		icon: '/icons/test.svg',
		proficiency: 'intermediate',
	},
	{
		id: 'concept-agile',
		label: 'Agile',
		description: 'Agile methodologies including Scrum and Kanban for iterative development.',
		x: 395,
		y: 30,
		parentId: 'concepts',
		category: 'skills',
		size: 'small',
		icon: '/icons/agile.svg',
		proficiency: 'advanced',
	},

	// ========== TOOLS & DEVOPS CHILDREN (5) ==========
	{
		id: 'tool-git',
		label: 'Git',
		description: 'Version control with Git, branching strategies, and collaborative workflows.',
		x: 530,
		y: 40,
		parentId: 'tools-devops',
		category: 'skills',
		size: 'small',
		icon: '/icons/git.svg',
		proficiency: 'expert',
	},
	{
		id: 'tool-docker',
		label: 'Docker',
		description: 'Containerization with Docker for consistent development and deployment environments.',
		x: 560,
		y: 95,
		parentId: 'tools-devops',
		category: 'skills',
		size: 'small',
		icon: '/icons/docker.svg',
		proficiency: 'advanced',
	},
	{
		id: 'tool-cicd',
		label: 'CI/CD',
		description: 'Continuous integration and deployment pipelines with GitHub Actions and Jenkins.',
		x: 555,
		y: 150,
		parentId: 'tools-devops',
		category: 'skills',
		size: 'small',
		icon: '/icons/cicd.svg',
		proficiency: 'intermediate',
	},
	{
		id: 'tool-vscod',
		label: 'VSCode',
		description: 'Powerful, lightweight code editor by Microsoft with built-in Git support, debugging, and a vast extension ecosystem.',
		x: 520,
		y: 205,
		parentId: 'tools-devops',
		category: 'skills',
		size: 'small',
		icon: '/icons/vscode-plain.svg',
		proficiency: 'advanced',
	},
	{
		id: 'tool-linux',
		label: 'Linux',
		description: 'Linux system administration, shell scripting, and server management.',
		x: 470,
		y: 245,
		parentId: 'tools-devops',
		category: 'skills',
		size: 'small',
		icon: '/icons/linux.svg',
		proficiency: 'advanced',
	},

	// ========== FRONTEND CHILDREN (6) ==========
	{
		id: 'fe-react',
		label: 'React',
		description: 'Building user interfaces with React, hooks, and state management.',
		x: 420,
		y: 295,
		parentId: 'frontend',
		category: 'skills',
		size: 'small',
		icon: '/icons/react.svg',
		proficiency: 'advanced',
	},
	{
		id: 'fe-redux',
		label: 'Redux',
		description: 'Predictable state management library for JavaScript applications, centralizing app state in a single store.',
		x: 450,
		y: 350,
		parentId: 'frontend',
		category: 'skills',
		size: 'small',
		icon: '/icons/redux.svg',
		proficiency: 'intermediate',
	},
	{
		id: 'fe-zustand',
		label: 'Zustand',
		description: 'Lightweight state management for React using a simple hooks-based API with minimal boilerplate.',
		x: 440,
		y: 405,
		parentId: 'frontend',
		category: 'skills',
		size: 'small',
		icon: '/icons/zustand-plain.svg',
		proficiency: 'intermediate',
	},
	{
		id: 'fe-tailwind',
		label: 'Tailwind CSS',
		description: 'Utility-first CSS framework for rapid UI development.',
		x: 400,
		y: 460,
		parentId: 'frontend',
		category: 'skills',
		size: 'small',
		icon: '/icons/tailwindcss.svg',
		proficiency: 'advanced',
	},
	{
		id: 'fe-shadcn',
		label: 'ShadCN/UI',
		description: 'Beautifully designed, accessible UI components that you copy and paste into your project. Built on Radix UI and Tailwind CSS.',
		x: 340,
		y: 500,
		parentId: 'frontend',
		category: 'skills',
		size: 'small',
		icon: '/icons/shadcnui.svg',
		proficiency: 'advanced',
	},
	{
		id: 'fe-pwa',
		label: 'PWA',
		description: 'Progressive Web Apps—web applications that deliver native app-like experiences with offline support, push notifications, and home screen installation.',
		x: 270,
		y: 520,
		parentId: 'frontend',
		category: 'skills',
		size: 'small',
		icon: '/icons/pwa.svg',
		proficiency: 'intermediate',
	},

	// ========== BACKEND & REAL-TIME CHILDREN (6) ==========
	{
		id: 'be-nodejs',
		label: 'Node.js',
		description: 'Server-side JavaScript runtime for building scalable applications.',
		x: 220,
		y: 330,
		parentId: 'backend-real-time',
		category: 'skills',
		size: 'small',
		icon: '/icons/nodedotjs.svg',
		proficiency: 'advanced',
	},
	{
		id: 'be-hapi',
		label: 'Hapi.js',
		description: 'Enterprise-grade Node.js framework for building scalable APIs and services with built-in validation, authentication, and caching.',
		x: 175,
		y: 370,
		parentId: 'backend-real-time',
		category: 'skills',
		size: 'small',
		icon: '/icons/hapi.svg',
		proficiency: 'advanced',
	},
	{
		id: 'be-nestjs',
		label: 'NestJS',
		description: 'Progressive Node.js framework for building efficient, scalable server-side applications with TypeScript and Angular-inspired architecture.',
		x: 115,
		y: 390,
		parentId: 'backend-real-time',
		category: 'skills',
		size: 'small',
		icon: '/icons/nestjs.svg',
		proficiency: 'intermediate',
	},
	{
		id: 'be-webrtc',
		label: 'WebRTC',
		description: 'Real-time communication protocol enabling peer-to-peer audio, video, and data streaming directly in the browser without plugins.',
		x: 50,
		y: 385,
		parentId: 'backend-real-time',
		category: 'skills',
		size: 'small',
		icon: '/icons/webrtc.svg',
		proficiency: 'intermediate',
	},
	{
		id: 'be-socketio',
		label: 'Socket.io',
		description: 'Real-time bidirectional event-based communication library for Node.js and browsers with automatic fallback support.',
		x: 0,
		y: 355,
		parentId: 'backend-real-time',
		category: 'skills',
		size: 'small',
		icon: '/icons/socketdotio.svg',
		proficiency: 'advanced',
	},
	{
		id: 'be-restfulapi',
		label: 'RESTful APIs',
		description: 'Architectural style for designing networked applications using stateless HTTP methods to perform CRUD operations on resources.',
		x: -25,
		y: 310,
		parentId: 'backend-real-time',
		category: 'skills',
		size: 'small',
		icon: '/icons/openapi.svg',
		proficiency: 'advanced',
	},

	// ========== LANGUAGES CHILDREN (7) ==========
	{
		id: 'lang-javascript',
		label: 'JavaScript',
		description: 'The language of the web. ES6+ features and beyond.',
		x: -135,
		y: 205,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/javascript.svg',
		proficiency: 'expert',
		yearsOfExperience: 5,
	},
	{
		id: 'lang-typescript',
		label: 'TypeScript',
		description: 'Type-safe JavaScript for scalable applications.',
		x: -175,
		y: 250,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/typescript.svg',
		proficiency: 'expert',
		yearsOfExperience: 5,
	},
	{
		id: 'lang-python',
		label: 'Python',
		description: 'Versatile language for scripting, data science, and backend.',
		x: -195,
		y: 300,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/python.svg',
		proficiency: 'intermediate',
		yearsOfExperience: 2,
	},
	{
		id: 'lang-rust',
		label: 'Rust',
		description: 'Systems programming language focused on safety, speed, and concurrency—guaranteeing memory safety without a garbage collector.',
		x: -190,
		y: 355,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/rust.svg',
		proficiency: 'beginner',
		yearsOfExperience: 1,
	},
	{
		id: 'lang-php',
		label: 'PHP',
		description: 'Server-side scripting language powering much of the web—from WordPress to Laravel, built for dynamic web content.',
		x: -165,
		y: 405,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/php.svg',
		proficiency: 'intermediate',
		yearsOfExperience: 2,
	},
	{
		id: 'lang-sql',
		label: 'SQL',
		description: 'Structured Query Language for database management.',
		x: -125,
		y: 450,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/mysql.svg',
		proficiency: 'intermediate',
		yearsOfExperience: 2,
	},
	{
		id: 'lang-bash',
		label: 'Bash',
		description: 'Shell scripting for automation and system tasks.',
		x: -75,
		y: 485,
		parentId: 'languages',
		category: 'skills',
		size: 'small',
		icon: '/icons/gnubash.svg',
		proficiency: 'intermediate',
		yearsOfExperience: 2,
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
		icon: '/icons/education.svg'
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
		institution: 'Green River College',
		degree: 'Bachelor\'s Degree of Applied Science',
		field: 'IT/Software Development',
		graduationYear: '2017',
		icon: '/icons/greenriver.png'

	},
	// {
	// 	id: 'edu-cert',
	// 	label: 'Certifications',
	// 	description: 'Additional certifications and courses completed.',
	// 	x: -280,
	// 	y: 180,
	// 	parentId: 'edu-branch',
	// 	category: 'education',
	// 	size: 'small',
	// },
];

// Colors for each category (PoE-inspired)
export const categoryColors: Record<TreeNode['category'], number> = {
	origin: 0xffd700,      // Gold
	experience: 0x4ecdc4,  // Teal
	projects: 0xff6b6b,    // Coral red
	skills: 0xf9a825,      // Amber orange
	education: 0xdda0dd,   // Plum purple
};