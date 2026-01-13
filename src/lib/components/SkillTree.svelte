<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Application, Graphics, Container, Assets, Sprite } from 'pixi.js';
	import { gsap } from 'gsap';
	import { treeNodes, categoryColors, type TreeNode } from '$lib/data';

	let container: HTMLDivElement;
	let selectedNode: TreeNode | null = null;
	let modalVisible = false;
	let showWelcomeTitle = true;

	// Tooltip state
	let hoveredNode: TreeNode | null = null;
	let tooltipX = 0;
	let tooltipY = 0;

	// Screen size detection
	let isMobile = false;
	let windowWidth = 0;
	let windowHeight = 0;

	let modalOpenedAt = 0;

	// Stats panel state
	let statsPanelVisible = false;
	let expandedBranches = new Set<string>([
		'concepts',
		'tools-devops',
		'frontend',
		'backend-real-time',
		'languages'
	]); // All expanded by default

	function openModal(node: TreeNode) {
		selectedNode = node;
		modalVisible = true;
		modalOpenedAt = Date.now();
		// Hide tooltip when modal opens
		hoveredNode = null;
	}

	function closeModal() {
	// Prevent closing if modal just opened (within 300ms)
	// This fixes touch events "bleeding through" on mobile
	if (Date.now() - modalOpenedAt < 300) {
		return;
	}
	
	modalVisible = false;
	setTimeout(() => {
		selectedNode = null;
	}, 200);
}

	function getCategoryColorHex(category: TreeNode['category']): string {
		const colorMap: Record<TreeNode['category'], string> = {
			origin: '#ffd700',
			experience: '#4ecdc4',
			projects: '#ff6b6b',
			skills: '#f9a825',
			education: '#dda0dd',
		};
		return colorMap[category];
	}

	// Helper functions for stats panel
	function calculatePlayerLevel(): number {
		// Find earliest start date from experience nodes
		const earliestStart = new Date('2020-10-01'); // First job
		const now = new Date();
		const millisPerYear = 1000 * 60 * 60 * 24 * 365.25;
		const years = (now.getTime() - earliestStart.getTime()) / millisPerYear;
		return Math.floor(years);
	}

	function getPlayerClass(): string {
		const originNode = treeNodes.find((node) => node.id === 'origin');
		return originNode?.jobTitle || 'Software Engineer';
	}

	function aggregateSkills() {
		const branchIds = ['concepts', 'tools-devops', 'frontend', 'backend-real-time', 'languages'];
		const branchLabels: Record<string, string> = {
			concepts: 'Concepts',
			'tools-devops': 'Tools & DevOps',
			frontend: 'Frontend',
			'backend-real-time': 'Backend & Real-Time',
			languages: 'Languages'
		};

		const result: Record<string, { label: string; skills: TreeNode[] }> = {};

		branchIds.forEach((branchId) => {
			const skills = treeNodes.filter(
				(node) => node.parentId === branchId && node.category === 'skills'
			);

			// Sort by proficiency (expert > advanced > intermediate > beginner)
			const proficiencyOrder: Record<string, number> = {
				expert: 0,
				advanced: 1,
				intermediate: 2,
				beginner: 3
			};
			skills.sort((a, b) => {
				const aOrder = proficiencyOrder[a.proficiency || 'beginner'];
				const bOrder = proficiencyOrder[b.proficiency || 'beginner'];
				return aOrder - bOrder;
			});

			result[branchId] = { label: branchLabels[branchId], skills };
		});

		return result;
	}

	function countByProficiency() {
		const counts = { expert: 0, advanced: 0, intermediate: 0, beginner: 0 };
		treeNodes.forEach((node) => {
			if (node.proficiency) {
				counts[node.proficiency]++;
			}
		});
		return counts;
	}

	function toggleStatsPanel() {
		statsPanelVisible = !statsPanelVisible;
		if (statsPanelVisible && modalVisible) {
			closeModal(); // Close modal when opening stats panel
		}
	}

	function toggleBranch(branchId: string) {
		if (expandedBranches.has(branchId)) {
			expandedBranches.delete(branchId);
		} else {
			expandedBranches.add(branchId);
		}
		expandedBranches = expandedBranches; // Trigger reactivity
	}

	// Stats calculations (reactive)
	$: playerLevel = calculatePlayerLevel();
	$: playerClass = getPlayerClass();
	$: skillsByBranch = aggregateSkills();
	$: skillCounts = countByProficiency();
	$: totalSkills = Object.values(skillCounts).reduce((sum, count) => sum + count, 0);

	// Update screen size
	function handleResize() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		isMobile = windowWidth < 768;
	}

	onMount(async () => {
		handleResize();
		window.addEventListener('resize', handleResize);

		const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

		const app = new Application();

		await app.init({
			background: '#05050a',
			resizeTo: container,
			antialias: true,
		});

		container.appendChild(app.canvas);

		// ========== BACKGROUND LAYERS ==========
		// We create multiple layers for depth
		const deepBackgroundContainer = new Container();
		const nebulaContainer = new Container();
		const starContainer = new Container();
		
		app.stage.addChild(deepBackgroundContainer);
		app.stage.addChild(nebulaContainer);
		app.stage.addChild(starContainer);

		const screenWidth = app.screen.width;
		const screenHeight = app.screen.height;
		const centerX = screenWidth / 2;
		const centerY = screenHeight / 2;

		// ========== DEEP SPACE GRADIENT ==========
		// Create a radial gradient from deep blue to black
		const spaceGradient = new Graphics();
		const gradientRadius = Math.max(screenWidth, screenHeight);
		
		// Layer multiple circles for a gradient effect
		const gradientSteps = 15;
		for (let i = gradientSteps; i >= 0; i--) {
			const ratio = i / gradientSteps;
			const radius = gradientRadius * (0.3 + ratio * 0.7);
			
			// Blend from deep purple/blue in center to pure black at edges
			const r = Math.floor(8 * (1 - ratio));
			const g = Math.floor(6 * (1 - ratio));
			const b = Math.floor(20 * (1 - ratio));
			const color = (r << 16) + (g << 8) + b;
			
			spaceGradient
				.circle(centerX, centerY, radius)
				.fill({ color: color, alpha: 0.8 });
		}
		deepBackgroundContainer.addChild(spaceGradient);

		// ========== NEBULA CLOUDS ==========
		const nebulaColors = [
			{ color: 0x4ecdc4, name: 'teal' },      // Experience
			{ color: 0xff6b6b, name: 'coral' },     // Projects
			{ color: 0xf9a825, name: 'amber' },     // Skills
			{ color: 0xdda0dd, name: 'plum' },      // Education
			{ color: 0x6b5b95, name: 'purple' },    // Extra accent
		];

		// Create large nebula cloud regions
		const nebulaRegions: { graphics: Graphics; baseX: number; baseY: number; pulseSpeed: number }[] = [];
		
		nebulaColors.forEach((nebula, index) => {
			// Position nebulas in different quadrants, offset from center
			const angle = (index / nebulaColors.length) * Math.PI * 2 + Math.PI / 4;
			const distance = Math.min(screenWidth, screenHeight) * 0.35;
			const baseX = centerX + Math.cos(angle) * distance;
			const baseY = centerY + Math.sin(angle) * distance;

			// Create multi-layered nebula cloud
			const nebulaCloud = new Graphics();
			
			// Outer very faint glow
			const outerSize = 200 + Math.random() * 150;
			for (let layer = 5; layer >= 0; layer--) {
				const layerRatio = layer / 5;
				const size = outerSize * (0.4 + layerRatio * 0.6);
				const alpha = 0.02 * (1 - layerRatio);
				
				nebulaCloud
					.circle(0, 0, size)
					.fill({ color: nebula.color, alpha: alpha });
			}

			// Add some irregular shapes for more organic look
			for (let i = 0; i < 3; i++) {
				const offsetX = (Math.random() - 0.5) * 100;
				const offsetY = (Math.random() - 0.5) * 100;
				const blobSize = 60 + Math.random() * 80;
				
				for (let layer = 3; layer >= 0; layer--) {
					const layerRatio = layer / 3;
					const size = blobSize * (0.5 + layerRatio * 0.5);
					const alpha = 0.03 * (1 - layerRatio);
					
					nebulaCloud
						.circle(offsetX, offsetY, size)
						.fill({ color: nebula.color, alpha: alpha });
				}
			}

			nebulaCloud.x = baseX;
			nebulaCloud.y = baseY;
			nebulaContainer.addChild(nebulaCloud);
			
			nebulaRegions.push({
				graphics: nebulaCloud,
				baseX: baseX,
				baseY: baseY,
				pulseSpeed: 0.5 + Math.random() * 0.5,
			});

			// Animate nebula pulsing
			gsap.to(nebulaCloud, {
				alpha: 0.6,
				duration: 3 + Math.random() * 2,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 2,
			});

			gsap.to(nebulaCloud.scale, {
				x: 1.1,
				y: 1.1,
				duration: 4 + Math.random() * 2,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 2,
			});
		});

		// ========== DISTANT STAR FIELD ==========
		// Layer 1: Tiny distant stars (many, dim)
		const distantStarCount = isMobile ? 100 : 200;
		for (let i = 0; i < distantStarCount; i++) {
			const star = new Graphics();
			const size = Math.random() * 1 + 0.5;
			const alpha = Math.random() * 0.4 + 0.1;

			star
				.circle(0, 0, size)
				.fill({ color: 0xffffff, alpha: alpha });

			star.x = Math.random() * screenWidth;
			star.y = Math.random() * screenHeight;
			starContainer.addChild(star);

			// Gentle twinkle
			gsap.to(star, {
				alpha: alpha * 0.3,
				duration: 1 + Math.random() * 2,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 3,
			});
		}

		// Layer 2: Medium stars with color tints
		const mediumStarCount = isMobile ? 30 : 60;
		const starTints = [0xffffff, 0xfff8e7, 0xe7f0ff, 0xffe7e7, 0xe7ffe7];
		
		for (let i = 0; i < mediumStarCount; i++) {
			const star = new Graphics();
			const size = Math.random() * 1.5 + 1;
			const alpha = Math.random() * 0.5 + 0.3;
			const tint = starTints[Math.floor(Math.random() * starTints.length)];

			// Star with subtle glow
			star
				.circle(0, 0, size + 2)
				.fill({ color: tint, alpha: alpha * 0.2 });
			star
				.circle(0, 0, size)
				.fill({ color: tint, alpha: alpha });

			star.x = Math.random() * screenWidth;
			star.y = Math.random() * screenHeight;
			starContainer.addChild(star);

			// Twinkle animation
			gsap.to(star, {
				alpha: alpha * 0.4,
				duration: 0.5 + Math.random() * 1.5,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 2,
			});
		}

		// Layer 3: Bright feature stars (few, prominent)
		const brightStarCount = isMobile ? 8 : 15;
		for (let i = 0; i < brightStarCount; i++) {
			const star = new Graphics();
			const size = Math.random() * 2 + 1.5;
			const tint = starTints[Math.floor(Math.random() * starTints.length)];

			// Multi-layer glow for bright stars
			star
				.circle(0, 0, size + 6)
				.fill({ color: tint, alpha: 0.05 });
			star
				.circle(0, 0, size + 3)
				.fill({ color: tint, alpha: 0.1 });
			star
				.circle(0, 0, size)
				.fill({ color: 0xffffff, alpha: 0.9 });

			star.x = Math.random() * screenWidth;
			star.y = Math.random() * screenHeight;
			starContainer.addChild(star);

			// Slow pulse for bright stars
			gsap.to(star.scale, {
				x: 1.3,
				y: 1.3,
				duration: 2 + Math.random() * 2,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 2,
			});
		}

		// ========== FLOATING DUST PARTICLES ==========
		const dustParticles: { graphics: Graphics; vx: number; vy: number }[] = [];
		const dustCount = isMobile ? 15 : 30;

		for (let i = 0; i < dustCount; i++) {
			const dust = new Graphics();
			const size = Math.random() * 2 + 1;
			const colorIndex = Math.floor(Math.random() * nebulaColors.length);
			const color = nebulaColors[colorIndex].color;

			// Soft glowing particle
			dust
				.circle(0, 0, size + 4)
				.fill({ color: color, alpha: 0.05 });
			dust
				.circle(0, 0, size + 2)
				.fill({ color: color, alpha: 0.08 });
			dust
				.circle(0, 0, size)
				.fill({ color: color, alpha: 0.15 });

			dust.x = Math.random() * screenWidth;
			dust.y = Math.random() * screenHeight;
			starContainer.addChild(dust);

			dustParticles.push({
				graphics: dust,
				vx: (Math.random() - 0.5) * 0.2,
				vy: (Math.random() - 0.5) * 0.2,
			});

			// Fade in and out
			gsap.to(dust, {
				alpha: 0.3,
				duration: 3 + Math.random() * 2,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 2,
			});
		}

		// Animate dust particles drifting
		app.ticker.add(() => {
			dustParticles.forEach((p) => {
				p.graphics.x += p.vx;
				p.graphics.y += p.vy;

				// Wrap around screen edges
				if (p.graphics.x < -20) p.graphics.x = screenWidth + 20;
				if (p.graphics.x > screenWidth + 20) p.graphics.x = -20;
				if (p.graphics.y < -20) p.graphics.y = screenHeight + 20;
				if (p.graphics.y > screenHeight + 20) p.graphics.y = -20;
			});
		});

		// ========== VIGNETTE OVERLAY ==========
		const vignette = new Graphics();
		const vignetteSize = Math.max(screenWidth, screenHeight) * 1.2;

		for (let i = 12; i >= 0; i--) {
			const ratio = i / 12;
			const radius = vignetteSize * (0.4 + ratio * 0.6);
			const alpha = ratio * ratio * 0.4;

			vignette
				.circle(centerX, centerY, radius)
				.fill({ color: 0x000000, alpha: alpha });
		}
		app.stage.addChild(vignette);

		// ========== TREE CONTAINER ==========
		const treeContainer = new Container();
		app.stage.addChild(treeContainer);

		// Initial position (centered)
		treeContainer.x = app.screen.width / 2;
		treeContainer.y = app.screen.height / 2;

		// Start zoomed in - will zoom out after welcome title
		// Mobile needs to zoom out further to show more of the tree
		const startScale = isMobile ? 3 : 4;
		const endScale = isMobile ? 0.6 : 1;
		treeContainer.scale.set(startScale);
		treeContainer.alpha = 1; // Tree is visible but zoomed in

		// ========== PAN & ZOOM STATE ==========
		let isDragging = false;
		let hasMoved = false;
		let dragStartX = 0;
		let dragStartY = 0;
		let containerStartX = 0;
		let containerStartY = 0;

		// Touch-specific state
		let lastTouchDistance = 0;
		let isTouchZooming = false;

		const minZoom = 0.3;
		const maxZoom = 2.5;

		// ========== MOUSE EVENTS FOR PANNING ==========
		app.canvas.addEventListener('mousedown', (e: MouseEvent) => {
			isDragging = true;
			hasMoved = false;
			dragStartX = e.clientX;
			dragStartY = e.clientY;
			containerStartX = treeContainer.x;
			containerStartY = treeContainer.y;
			app.canvas.style.cursor = 'grabbing';
		});

		window.addEventListener('mousemove', (e: MouseEvent) => {
			if (!isDragging) return;
			const dx = e.clientX - dragStartX;
			const dy = e.clientY - dragStartY;
			if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
				hasMoved = true;
			}
			treeContainer.x = containerStartX + dx;
			treeContainer.y = containerStartY + dy;
		});

		window.addEventListener('mouseup', () => {
			isDragging = false;
			app.canvas.style.cursor = 'grab';
		});

		app.canvas.style.cursor = 'grab';

		// Track mouse position for tooltip
		app.canvas.addEventListener('mousemove', (e: MouseEvent) => {
			tooltipX = e.clientX;
			tooltipY = e.clientY;
		});

		// ========== TOUCH EVENTS FOR PANNING & ZOOMING ==========
		app.canvas.addEventListener('touchstart', (e: TouchEvent) => {
			if (e.touches.length === 1) {
				// Single touch - start panning
				isDragging = true;
				hasMoved = false;
				isTouchZooming = false;
				dragStartX = e.touches[0].clientX;
				dragStartY = e.touches[0].clientY;
				containerStartX = treeContainer.x;
				containerStartY = treeContainer.y;
			} else if (e.touches.length === 2) {
				// Two touches - start pinch zoom
				isDragging = false;
				isTouchZooming = true;
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
			}
		}, { passive: true });

		// ========== TOUCH EVENTS FOR PANNING & ZOOMING ==========
		let touchStartedOnNode = false;

		app.canvas.addEventListener('touchstart', (e: TouchEvent) => {
			// Check if touch started on a node by seeing if the target is interactive
			touchStartedOnNode = false;
			
			if (e.touches.length === 1) {
				// Single touch - prepare for potential panning
				isDragging = true;
				hasMoved = false;
				isTouchZooming = false;
				dragStartX = e.touches[0].clientX;
				dragStartY = e.touches[0].clientY;
				containerStartX = treeContainer.x;
				containerStartY = treeContainer.y;
			} else if (e.touches.length === 2) {
				// Two touches - start pinch zoom
				isDragging = false;
				isTouchZooming = true;
				hasMoved = true; // Pinch zoom counts as movement
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
			}
		}, { passive: true });

		app.canvas.addEventListener('touchmove', (e: TouchEvent) => {
			if (e.touches.length === 1 && isDragging && !isTouchZooming) {
				// Single touch - panning
				const dx = e.touches[0].clientX - dragStartX;
				const dy = e.touches[0].clientY - dragStartY;
				
				// Only count as moved if we've moved more than a small threshold
				if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
					hasMoved = true;
					treeContainer.x = containerStartX + dx;
					treeContainer.y = containerStartY + dy;
				}
			} else if (e.touches.length === 2 && isTouchZooming) {
				// Two touches - pinch zoom
				const dx = e.touches[0].clientX - e.touches[1].clientX;
				const dy = e.touches[0].clientY - e.touches[1].clientY;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (lastTouchDistance > 0) {
					const scale = distance / lastTouchDistance;
					let newScale = treeContainer.scale.x * scale;
					newScale = Math.max(minZoom, Math.min(maxZoom, newScale));

					// Zoom toward center of the two touches
					const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
					const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
					const rect = app.canvas.getBoundingClientRect();
					const mouseX = centerX - rect.left;
					const mouseY = centerY - rect.top;

					const oldScale = treeContainer.scale.x;
					const worldX = (mouseX - treeContainer.x) / oldScale;
					const worldY = (mouseY - treeContainer.y) / oldScale;

					treeContainer.scale.set(newScale);
					treeContainer.x = mouseX - worldX * newScale;
					treeContainer.y = mouseY - worldY * newScale;
				}

				lastTouchDistance = distance;
				hasMoved = true;
			}
		}, { passive: true });

		app.canvas.addEventListener('touchend', (e: TouchEvent) => {
			if (e.touches.length === 0) {
				isDragging = false;
				isTouchZooming = false;
				lastTouchDistance = 0;
			} else if (e.touches.length === 1) {
				// Went from 2 touches to 1 - reset pan start
				isTouchZooming = false;
				isDragging = true;
				hasMoved = true; // Consider this movement since we were zooming
				dragStartX = e.touches[0].clientX;
				dragStartY = e.touches[0].clientY;
				containerStartX = treeContainer.x;
				containerStartY = treeContainer.y;
			}
		}, { passive: true });

		// ========== SCROLL EVENT FOR ZOOMING ==========
		app.canvas.addEventListener('wheel', (e: WheelEvent) => {
			e.preventDefault();
			const rect = app.canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const oldScale = treeContainer.scale.x;
			const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
			let newScale = Math.max(minZoom, Math.min(maxZoom, oldScale * zoomFactor));
			const worldX = (mouseX - treeContainer.x) / oldScale;
			const worldY = (mouseY - treeContainer.y) / oldScale;
			treeContainer.scale.set(newScale);
			treeContainer.x = mouseX - worldX * newScale;
			treeContainer.y = mouseY - worldY * newScale;
		});

		// ========== HELPER FUNCTIONS ==========
		function getNodeById(id: string): TreeNode | undefined {
			return treeNodes.find((node) => node.id === id);
		}

		function getNodeRadius(size: TreeNode['size']): number {
			const mobileFactor = isMobile ? 0.8 : 1;
			switch (size) {
                case 'x-large':
                    return 75 * mobileFactor;
				case 'large':
					return 30 * mobileFactor;
				case 'medium':
					return 25 * mobileFactor;
				case 'small':
					return 20 * mobileFactor;
				default:
					return 14 * mobileFactor;
			}
		}

		function getDistanceFromOrigin(node: TreeNode): number {
			return Math.sqrt(node.x * node.x + node.y * node.y);
		}

		// ========== DRAW GLOWING LINES ==========
		const lineObjects: { graphics: Graphics; glowGraphics: Graphics; node: TreeNode; parent: TreeNode }[] = [];

		for (const node of treeNodes) {
			if (node.parentId) {
				const parent = getNodeById(node.parentId);
				if (parent) {
					const glowGraphics = new Graphics();
					glowGraphics.alpha = 0;
					glowGraphics
						.moveTo(parent.x, parent.y)
						.lineTo(node.x, node.y)
						.stroke({ width: 8, color: categoryColors[node.category], alpha: 0.15 });
					treeContainer.addChild(glowGraphics);

					const lineGraphics = new Graphics();
					lineGraphics.alpha = 0;
					lineGraphics
						.moveTo(parent.x, parent.y)
						.lineTo(node.x, node.y)
						.stroke({ width: 2, color: 0x4a4a5a });
					treeContainer.addChild(lineGraphics);

					lineObjects.push({ graphics: lineGraphics, glowGraphics, node, parent });
				}
			}
		}

		// ========== DRAW NODES ==========
		const nodeObjects: { graphics: Graphics | Container; node: TreeNode; glowGraphics: Graphics }[] = [];

		const profileTexture = await Assets.load('/headshot.jpg');

		for (const node of treeNodes) {
			const radius = getNodeRadius(node.size);
			const color = categoryColors[node.category];

			const glowGraphics = new Graphics();
			glowGraphics
				.circle(0, 0, radius + 8)
				.fill({ color: color, alpha: 0.1 });
			glowGraphics
				.circle(0, 0, radius + 4)
				.fill({ color: color, alpha: 0.15 });
			glowGraphics.x = node.x;
			glowGraphics.y = node.y;
			glowGraphics.alpha = 0;
			treeContainer.addChild(glowGraphics);

			if (node.id === 'origin') {
				const profileContainer = new Container();
				profileContainer.x = node.x;
				profileContainer.y = node.y;

				const maskGraphics = new Graphics();
				maskGraphics
					.circle(0, 0, radius)
					.fill({ color: 0xffffff });
				profileContainer.addChild(maskGraphics);

				const profileSprite = new Sprite(profileTexture);
				const scale = (radius * 2) / Math.min(profileTexture.width, profileTexture.height);
				profileSprite.scale.set(scale);
				profileSprite.anchor.set(0.5);
				profileSprite.mask = maskGraphics;
				profileContainer.addChild(profileSprite);

				const borderGraphics = new Graphics();
				borderGraphics
					.circle(0, 0, radius + 2)
					.stroke({ width: 3, color: color });
				borderGraphics
					.circle(0, 0, radius + 6)
					.stroke({ width: 2, color: color, alpha: 0.5 });
				profileContainer.addChild(borderGraphics);

				profileContainer.alpha = 0;
				profileContainer.scale.set(0.5);

				profileContainer.eventMode = 'static';
				profileContainer.cursor = 'pointer';

				profileContainer.on('pointerdown', () => {
					hasMoved = false;
				});

				profileContainer.on('pointerup', () => {
					if (!hasMoved) {
						openModal(node);
					}
				});

				profileContainer.on('pointerover', () => {
					gsap.to(profileContainer.scale, { x: 1.2, y: 1.2, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1.5, duration: 0.2 });
					if (!isTouchDevice) hoveredNode = node;
				});

				profileContainer.on('pointerout', () => {
					gsap.to(profileContainer.scale, { x: 1, y: 1, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1, duration: 0.2 });
					if (!isTouchDevice) hoveredNode = null;
				});

				treeContainer.addChild(profileContainer);
				nodeObjects.push({ graphics: profileContainer, node, glowGraphics });

			} else {
				const nodeContainer = new Container();
				nodeContainer.x = node.x;
				nodeContainer.y = node.y;

				const nodeGraphics = new Graphics();

				nodeGraphics
					.circle(0, 0, radius)
					.fill({ color: 0x12121a })
					.stroke({ width: 2, color: color });

				nodeGraphics
					.circle(0, 0, radius * 0.75)
					.stroke({ width: 1, color: color, alpha: 0.2 });

				nodeContainer.addChild(nodeGraphics);

				if (node.icon) {
					try {
						const iconTexture = await Assets.load(node.icon);
						const iconSprite = new Sprite(iconTexture);

						const iconSize = radius * 1.4;
						const scale = iconSize / Math.max(iconTexture.width, iconTexture.height);
						iconSprite.scale.set(scale);
						iconSprite.anchor.set(0.5);
						iconSprite.tint = color;

						nodeContainer.addChild(iconSprite);
					} catch (e) {
						console.warn(`Could not load icon for ${node.id}:`, node.icon);
					}
				}

				nodeContainer.alpha = 0;
				nodeContainer.scale.set(0.5);

				nodeContainer.eventMode = 'static';
				nodeContainer.cursor = 'pointer';

				nodeContainer.on('pointerdown', () => {
					hasMoved = false;
				});

				nodeContainer.on('pointerup', () => {
					if (!hasMoved) {
						openModal(node);
					}
				});

				nodeContainer.on('pointerover', () => {
					gsap.to(nodeContainer.scale, { x: 1.2, y: 1.2, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1.5, duration: 0.2 });
					if (!isTouchDevice) hoveredNode = node;
				});

				nodeContainer.on('pointerout', () => {
					gsap.to(nodeContainer.scale, { x: 1, y: 1, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1, duration: 0.2 });
					if (!isTouchDevice) hoveredNode = null;
				});

				treeContainer.addChild(nodeContainer);
				nodeObjects.push({ graphics: nodeContainer, node, glowGraphics });
			}
		}

		// ========== ENTRANCE ANIMATIONS (Sequenced) ==========
		
		// Timeline:
		// 0.0s - 2.5s: Welcome title displays (handled by CSS)
		// 2.5s: Title starts fading, origin node appears
		// 3.0s: Zoom out begins, tree starts populating
		// 6.0s: Animation complete
		
		// Responsive animation timing
		const titleDuration = isMobile ? 1.5 : 2.5;
		const zoomDuration = isMobile ? 2.5 : 4.5;
		const nodeStagger = isMobile ? 0.05 : 0.08;
		
		// Hide all lines initially
		lineObjects.forEach((line) => {
			line.graphics.alpha = 0;
			line.glowGraphics.alpha = 0;
		});
		
		// Hide all nodes initially
		nodeObjects.forEach((obj) => {
			obj.graphics.alpha = 0;
			obj.graphics.scale.set(0.5);
			obj.glowGraphics.alpha = 0;
		});
		
		// Sort nodes by distance from origin
		const sortedNodes = [...nodeObjects].sort(
			(a, b) => getDistanceFromOrigin(a.node) - getDistanceFromOrigin(b.node)
		);
		
		const sortedLines = [...lineObjects].sort(
			(a, b) => getDistanceFromOrigin(a.node) - getDistanceFromOrigin(b.node)
		);
		
		// STEP 1: After title fades, show origin node first
		// On mobile, start origin animation BEFORE title fully fades (overlap them)
		const originNode = sortedNodes.find(obj => obj.node.id === 'origin');
		const originDelay = isMobile ? titleDuration - 0.5 : titleDuration;
		const originDuration = isMobile ? 0.3 : 0.6;

		// Pre-set origin node to be ready (reduces perceived delay on mobile)
		if (originNode && isMobile) {
			originNode.graphics.scale.set(0.8); // Start slightly larger
		}
		
		if (originNode) {
			gsap.to(originNode.graphics, {
				alpha: 1,
				duration: originDuration,
				delay: originDelay,
				ease: 'power2.out',
			});
			gsap.to(originNode.graphics.scale, {
				x: 1,
				y: 1,
				duration: originDuration,
				delay: originDelay,
				ease: 'back.out(1.7)',
			});
			gsap.to(originNode.glowGraphics, {
				alpha: 1,
				duration: originDuration,
				delay: originDelay,
				ease: 'power2.out',
			});
		}
		
		// STEP 2: Start zoom out after origin appears
		const zoomDelay = isMobile ? titleDuration - 0.3 : titleDuration + 0.3;
		
		gsap.to(treeContainer.scale, {
			x: endScale,
			y: endScale,
			duration: zoomDuration,
			delay: zoomDelay,
			ease: 'power1.out',
		});
		
		// STEP 3: Animate in the rest of the nodes (excluding origin)
		const otherNodes = sortedNodes.filter(obj => obj.node.id !== 'origin');
		const nodeStartDelay = isMobile ? titleDuration - 0.2 : titleDuration + 0.5;
		
		otherNodes.forEach((obj, index) => {
			const delay = nodeStartDelay + (index * nodeStagger);
			
			gsap.to(obj.graphics, {
				alpha: 1,
				duration: 0.5,
				delay: delay,
				ease: 'power2.out',
			});
			gsap.to(obj.graphics.scale, {
				x: 1,
				y: 1,
				duration: 0.5,
				delay: delay,
				ease: 'back.out(1.7)',
			});
			gsap.to(obj.glowGraphics, {
				alpha: 1,
				duration: 0.5,
				delay: delay,
				ease: 'power2.out',
			});
			
			// Start ambient pulse after node appears
			gsap.to(obj.glowGraphics.scale, {
				x: 1.4,
				y: 1.4,
				duration: 2 + Math.random() * 1,
				delay: delay + 0.5,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
			});
		});
		
		// Start origin pulse too
		if (originNode) {
			gsap.to(originNode.glowGraphics.scale, {
				x: 1.4,
				y: 1.4,
				duration: 2 + Math.random() * 1,
				delay: titleDuration + 1,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
			});
		}
		
		// STEP 4: Animate lines as nodes appear
		const lineStartDelay = isMobile ? titleDuration - 0.3 : titleDuration + 0.4;
		
		sortedLines.forEach((line, index) => {
			const delay = lineStartDelay + (index * nodeStagger);
			
			gsap.to(line.graphics, {
				alpha: 1,
				duration: 0.4,
				delay: delay,
				ease: 'power2.out',
			});
			gsap.to(line.glowGraphics, {
				alpha: 1,
				duration: 0.6,
				delay: delay + 0.1,
				ease: 'power2.out',
			});
		});
			
		// Clean up title card after animation (matches titleDuration)
		setTimeout(() => {
			showWelcomeTitle = false;
		}, isMobile ? 1500 : 2500);

		// Fade in stats panel toggle button with the tree
		const toggleButton = document.querySelector('.stats-panel-toggle');
		if (toggleButton) {
			gsap.to(toggleButton, {
				opacity: 1,
				duration: 0.5,
				delay: nodeStartDelay + (otherNodes.length * nodeStagger * 0.5), // Fade in midway through node animation
				ease: 'power2.out',
			});
		}

		// Keyboard event handler for stats panel
		function handleKeydown(e: KeyboardEvent) {
			// Toggle stats panel with 'C' key
			if (e.key === 'c' || e.key === 'C') {
				if (!modalVisible) {
					toggleStatsPanel();
				}
			}

			// Escape key priority: modal > stats panel
			if (e.key === 'Escape') {
				if (modalVisible) {
					closeModal();
				} else if (statsPanelVisible) {
					toggleStatsPanel();
				}
			}
		}

		window.addEventListener('keydown', handleKeydown);

		console.log('✨ Responsive skill tree loaded!');

		return () => {
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('keydown', handleKeydown);
		};
	});

	// Calculate tooltip position to keep it on screen
	$: tooltipStyle = (() => {
		let x = tooltipX + 15;
		let y = tooltipY + 15;

		// Keep tooltip on screen
		const tooltipWidth = 280;
		const tooltipHeight = 120;

		if (x + tooltipWidth > windowWidth) {
			x = tooltipX - tooltipWidth - 15;
		}
		if (y + tooltipHeight > windowHeight) {
			y = tooltipY - tooltipHeight - 15;
		}

		return `left: ${x}px; top: ${y}px;`;
	})();
</script>

<svelte:window bind:innerWidth={windowWidth} bind:innerHeight={windowHeight} />

<div bind:this={container} class="canvas-container"></div>

<!-- Welcome Title Card -->
{#if showWelcomeTitle}
	<div class="welcome-title" class:fade-out={!showWelcomeTitle}>
		<h1>Kevin Riehl</h1>
		<p>The Atlas of Skills</p>
	</div>
{/if}

<!-- Hover Tooltip (hidden on mobile) -->
{#if hoveredNode && !modalVisible && !isMobile}
	<div
		class="tooltip"
		style="{tooltipStyle} --node-color: {getCategoryColorHex(hoveredNode.category)};"
	>
		<h3>
			{#if hoveredNode.icon}
				<img src={hoveredNode.icon} alt="" class="tooltip-icon" />
			{/if}
			{hoveredNode.label}
		</h3>
		<p>{hoveredNode.description}</p>
		<span class="hint">Click for details</span>
	</div>
{/if}

<!-- Modal Overlay -->
{#if selectedNode}
	<div
		class="modal-backdrop"
		class:visible={modalVisible}
		on:click={closeModal}
		on:keydown={(e) => e.key === 'Escape' && closeModal()}
		role="button"
		tabindex="0"
	>
		<div
			class="modal"
			class:visible={modalVisible}
			on:click|stopPropagation
			role="dialog"
			style="--node-color: {getCategoryColorHex(selectedNode.category)}"
		>
			<button class="close-btn" on:click={closeModal}>✕</button>

			<h2>
				{#if selectedNode.icon}
					<img src={selectedNode.icon} alt="" class="modal-icon" />
				{/if}
				{selectedNode.label}
			</h2>

			<span class="category-badge">{selectedNode.category}</span>

			<!-- Origin-specific content -->
			{#if selectedNode.category === 'origin'}
				{#if selectedNode.jobTitle}
					<div class="origin-title">{selectedNode.jobTitle}</div>
				{/if}
				{#if selectedNode.location}
					<div class="origin-location">📍 {selectedNode.location}</div>
				{/if}
				{#if selectedNode.aboutMe}
					<p class="about-me">{selectedNode.aboutMe}</p>
				{/if}
				{#if selectedNode.email || selectedNode.linkedIn || selectedNode.github || selectedNode.website}
					<div class="social-links">
						{#if selectedNode.email}
							<a href="mailto:{selectedNode.email}" title="Email">✉️ Email</a>
						{/if}
						{#if selectedNode.linkedIn}
							<a href={selectedNode.linkedIn} target="_blank" rel="noopener noreferrer" title="LinkedIn">💼 LinkedIn</a>
						{/if}
						{#if selectedNode.github}
							<a href={selectedNode.github} target="_blank" rel="noopener noreferrer" title="GitHub">💻 GitHub</a>
						{/if}
						{#if selectedNode.website}
							<a href={selectedNode.website} target="_blank" rel="noopener noreferrer" title="Website">🌐 Website</a>
						{/if}
					</div>
					{#if selectedNode.resumeUrl}
					<a
						href={selectedNode.resumeUrl}
						download
						class="resume-button"
					>
						📄 Download Resume
					</a>
				{/if}
				{/if}
			{/if}

			<!-- Experience-specific content -->
			{#if selectedNode.company}
				<div class="meta-info">
					<span class="company">{selectedNode.company}</span>
					{#if selectedNode.startDate}
						<span class="dates">{selectedNode.startDate} — {selectedNode.endDate || 'Present'}</span>
					{/if}
				</div>
			{/if}

			<!-- Education-specific content -->
			{#if selectedNode.institution}
				<div class="meta-info">
					<span class="company">{selectedNode.institution}</span>
					{#if selectedNode.degree}
						<span class="dates">{selectedNode.degree} in {selectedNode.field || 'N/A'}</span>
					{/if}
					{#if selectedNode.graduationYear}
						<span class="dates">Graduated {selectedNode.graduationYear}</span>
					{/if}
				</div>
			{/if}

			<!-- Skill-specific content -->
			{#if selectedNode.proficiency}
				<div class="meta-info">
					<span class="proficiency-badge {selectedNode.proficiency}">{selectedNode.proficiency}</span>
					{#if selectedNode.yearsOfExperience}
						<span class="dates">{selectedNode.yearsOfExperience} years experience</span>
					{/if}
				</div>
			{/if}

			{#if selectedNode.category !== 'origin'}
				<p>{selectedNode.description}</p>
			{/if}

			<!-- Highlights (for experience) -->
			{#if selectedNode.highlights && selectedNode.highlights.length > 0}
				<ul class="highlights">
					{#each selectedNode.highlights as highlight}
						<li>{highlight}</li>
					{/each}
				</ul>
			{/if}

			<!-- Tech stack (for projects) -->
			{#if selectedNode.techStack && selectedNode.techStack.length > 0}
				<div class="tech-stack">
					{#each selectedNode.techStack as tech}
						<span class="tech-tag">{tech}</span>
					{/each}
				</div>
			{/if}

			<!-- Project status badge -->
			{#if selectedNode.status}
				<div class="project-status">
					<span class="status-badge {selectedNode.status}">{selectedNode.status}</span>
				</div>
			{/if}

			<!-- Links (for projects) -->
			{#if selectedNode.projectUrl || selectedNode.repoUrl || selectedNode.pypiUrl || selectedNode.npmUrl}
				<div class="links">
					{#if selectedNode.projectUrl}
						<a href={selectedNode.projectUrl} target="_blank" rel="noopener noreferrer">🔗 Live Site</a>
					{/if}
					{#if selectedNode.repoUrl}
						<a href={selectedNode.repoUrl} target="_blank" rel="noopener noreferrer">💻 Repository</a>
					{/if}
					{#if selectedNode.pypiUrl}
						<a href={selectedNode.pypiUrl} target="_blank" rel="noopener noreferrer">📦 PyPI</a>
					{/if}
					{#if selectedNode.npmUrl}
						<a href={selectedNode.npmUrl} target="_blank" rel="noopener noreferrer">📦 npm</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Stats Panel Toggle Button -->
<button
	class="stats-panel-toggle"
	class:open={statsPanelVisible}
	on:click={toggleStatsPanel}
	title="Character Stats (C)"
	aria-label="Toggle Character Stats Panel (Keyboard shortcut: C)"
>
	⚙️
</button>

<!-- Stats Panel Backdrop -->
{#if statsPanelVisible}
	<div class="stats-panel-backdrop visible" on:click={toggleStatsPanel}></div>
{/if}

<!-- Stats Panel -->
<div class="stats-panel" class:visible={statsPanelVisible} role="complementary" aria-label="Character Statistics">
	<!-- Character Card -->
	<div class="character-card">
		<img src="/headshot.jpg" alt="Character Portrait" class="character-portrait" />

		<div class="character-stats-bar">
			<div class="stat-item">
				<span>⚔️</span>
				<span class="stat-label">LVL</span>
				<span>{playerLevel}</span>
			</div>
		</div>

		<h1 class="character-name">Kevin Riehl</h1>
		<p class="character-title">{playerClass}</p>
	</div>

	<!-- Skills Section -->
	<div class="skills-section">
		<!-- Proficiency Summary -->
		<div class="proficiency-summary">
			<h3>⚡ Skill Mastery</h3>
			<div class="proficiency-row">
				<span class="proficiency-label">⭐⭐⭐ Expert</span>
				<span class="proficiency-count">{skillCounts.expert}</span>
			</div>
			<div class="proficiency-row">
				<span class="proficiency-label">⭐⭐ Advanced</span>
				<span class="proficiency-count">{skillCounts.advanced}</span>
			</div>
			<div class="proficiency-row">
				<span class="proficiency-label">⭐ Intermediate</span>
				<span class="proficiency-count">{skillCounts.intermediate}</span>
			</div>
			<div class="proficiency-row">
				<span class="proficiency-label">Beginner</span>
				<span class="proficiency-count">{skillCounts.beginner}</span>
			</div>
			<div
				class="proficiency-row"
				style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 0.5rem; padding-top: 0.5rem;"
			>
				<span class="proficiency-label">Total Skills</span>
				<span class="proficiency-count">{totalSkills}</span>
			</div>
		</div>

		<!-- Skill Branches -->
		{#each Object.entries(skillsByBranch) as [branchId, branch]}
			<div class="skill-branch">
				<div
					class="branch-header"
					on:click={() => toggleBranch(branchId)}
					on:keydown={(e) => e.key === 'Enter' && toggleBranch(branchId)}
					tabindex="0"
					role="button"
					aria-expanded={expandedBranches.has(branchId)}
				>
					<img
						src={treeNodes.find((n) => n.id === branchId)?.icon || ''}
						alt=""
						class="branch-icon"
					/>
					<span class="branch-title">{branch.label}</span>
					<span class="branch-count">({branch.skills.length})</span>
					<span class="expand-icon" class:expanded={expandedBranches.has(branchId)}>▼</span>
				</div>

				{#if expandedBranches.has(branchId)}
					<div class="skill-list" transition:slide={{ duration: 300 }}>
						{#each branch.skills as skill}
							<div class="skill-item">
								{#if skill.icon}
									<img src={skill.icon} alt="" class="skill-item-icon" />
								{/if}
								<span class="skill-name">{skill.label}</span>
								<span class="skill-proficiency">
									{#if skill.proficiency === 'expert'}
										<span class="proficiency-stars">⭐⭐⭐</span>
									{:else if skill.proficiency === 'advanced'}
										<span class="proficiency-stars">⭐⭐</span>
									{:else if skill.proficiency === 'intermediate'}
										<span class="proficiency-stars">⭐</span>
									{/if}
									<span>{skill.proficiency || ''}</span>
								</span>
								{#if skill.yearsOfExperience}
									<span class="skill-years">{skill.yearsOfExperience}y</span>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.canvas-container {
		width: 100%;
		height: 100%;
		touch-action: none;
	}

	/* Tooltip Styles */
	.tooltip {
		position: fixed;
		background: linear-gradient(145deg, #1a1a2e 0%, #12121a 100%);
		border: 1px solid var(--node-color);
		border-radius: 8px;
		padding: 0.75rem 1rem;
		max-width: 280px;
		pointer-events: none;
		z-index: 500;
		box-shadow:
			0 0 20px color-mix(in srgb, var(--node-color) 25%, transparent),
			0 4px 12px rgba(0, 0, 0, 0.5);
		animation: tooltipFadeIn 0.15s ease-out;
	}

	@keyframes tooltipFadeIn {
		from {
			opacity: 0;
			transform: translateY(5px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tooltip h3 {
		color: var(--node-color);
		margin: 0 0 0.35rem 0;
		font-size: 0.95rem;
		text-shadow: 0 0 10px var(--node-color);
	}

	.tooltip p {
		color: #a8a8b8;
		margin: 0 0 0.5rem 0;
		font-size: 0.8rem;
		line-height: 1.5;
	}

	.tooltip .hint {
		color: #666;
		font-size: 0.7rem;
		font-style: italic;
	}

	.tooltip-icon {
		width: 1.2em;
		height: 1.2em;
		vertical-align: middle;
		margin-right: 0.4rem;
		filter: drop-shadow(0 0 4px var(--node-color));
	}

	/* Modal Styles */
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		transition: background 0.2s ease;
		backdrop-filter: blur(0px);
		padding: 1rem;
		box-sizing: border-box;
	}

	.modal-backdrop.visible {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
	}

	.modal {
		background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
		border: 1px solid var(--node-color);
		border-radius: 12px;
		padding: 1.5rem;
		max-width: 420px;
		width: 100%;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
		box-shadow:
			0 0 40px color-mix(in srgb, var(--node-color) 30%, transparent),
			0 0 80px color-mix(in srgb, var(--node-color) 15%, transparent),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		opacity: 0;
		transform: scale(0.9) translateY(20px);
		transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.modal.visible {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	.modal h2 {
		color: var(--node-color);
		margin: 0 0 0.5rem 0;
		font-size: 1.3rem;
		text-shadow: 0 0 20px var(--node-color);
		padding-right: 2rem;
	}

	.modal-icon {
		width: 1.4em;
		height: 1.4em;
		vertical-align: middle;
		margin-right: 0.5rem;
		filter: drop-shadow(0 0 8px var(--node-color));
	}

	.category-badge {
		display: inline-block;
		background: linear-gradient(135deg, var(--node-color), color-mix(in srgb, var(--node-color) 70%, black));
		color: #0a0a0f;
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 1rem;
	}

	.modal p {
		color: #a8a8b8;
		line-height: 1.7;
		margin: 0;
		font-size: 0.9rem;
	}

	.close-btn {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		background: none;
		border: none;
		color: #666;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0.5rem;
		transition: all 0.15s;
		border-radius: 4px;
		line-height: 1;
	}

	.close-btn:hover {
		color: white;
		background: rgba(255, 255, 255, 0.1);
	}

	/* Origin-specific styles */
	.origin-title {
		color: var(--node-color);
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 0.25rem;
		text-shadow: 0 0 10px var(--node-color);
	}

	.origin-location {
		color: #888;
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}

	.about-me {
		color: #a8a8b8;
		line-height: 1.7;
		margin: 0 0 1rem 0;
		font-size: 0.9rem;
	}

	.social-links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.social-links a {
		color: #ccc;
		text-decoration: none;
		font-size: 0.8rem;
		padding: 0.4rem 0.6rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.15s ease;
	}

	.social-links a:hover {
		color: var(--node-color);
		background: rgba(255, 255, 255, 0.1);
		border-color: var(--node-color);
	}

	/* Meta info styles */
	.meta-info {
		margin-bottom: 0.75rem;
	}

	.meta-info .company {
		display: block;
		color: var(--node-color);
		font-weight: 600;
		font-size: 0.9rem;
	}

	.meta-info .dates {
		display: block;
		color: #888;
		font-size: 0.8rem;
		margin-top: 0.2rem;
	}

	.proficiency-badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: bold;
		text-transform: uppercase;
		margin-right: 0.5rem;
	}

	.proficiency-badge.beginner {
		background: #4a5568;
		color: #e2e8f0;
	}

	.proficiency-badge.intermediate {
		background: #2b6cb0;
		color: #bee3f8;
	}

	.proficiency-badge.advanced {
		background: #2f855a;
		color: #c6f6d5;
	}

	.proficiency-badge.expert {
		background: #b7791f;
		color: #fefcbf;
	}

	.highlights {
		margin: 0.75rem 0 0 0;
		padding-left: 1.2rem;
		color: #a8a8b8;
		font-size: 0.8rem;
	}

	.highlights li {
		margin-bottom: 0.4rem;
		line-height: 1.4;
	}

	.tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.75rem;
	}

	.tech-tag {
		background: rgba(255, 255, 255, 0.1);
		color: #ccc;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.7rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.links a {
		color: var(--node-color);
		text-decoration: none;
		font-size: 0.8rem;
		transition: opacity 0.15s;
	}

	.links a:hover {
		opacity: 0.8;
		text-decoration: underline;
	}

	/* Mobile-specific styles */
	@media (max-width: 767px) {
		.modal {
			padding: 1.25rem;
			max-height: 85vh;
			border-radius: 16px 16px 0 0;
			margin-top: auto;
		}

		.modal-backdrop {
			align-items: flex-end;
			padding: 0;
		}

		.modal h2 {
			font-size: 1.2rem;
		}

		.social-links {
			gap: 0.4rem;
		}

		.social-links a {
			font-size: 0.75rem;
			padding: 0.35rem 0.5rem;
		}

		.close-btn {
			top: 0.5rem;
			right: 0.5rem;
			font-size: 1.75rem;
			padding: 0.75rem;
		}
	}

	.resume-button {
		display: block;
		width: 100%;
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, var(--node-color), color-mix(in srgb, var(--node-color) 70%, black));
		color: #0a0a0f;
		text-align: center;
		text-decoration: none;
		font-weight: 600;
		font-size: 0.9rem;
		border-radius: 8px;
		transition: all 0.2s ease;
		box-shadow: 0 0 20px color-mix(in srgb, var(--node-color) 30%, transparent);
	}

	.resume-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 0 30px color-mix(in srgb, var(--node-color) 50%, transparent);
	}

	.resume-button:active {
		transform: translateY(0);
	}

	.project-status {
		margin: 0.75rem 0;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-badge.active {
		background: #2f855a;
		color: #c6f6d5;
	}

	.status-badge.maintained {
		background: #2b6cb0;
		color: #bee3f8;
	}

	.status-badge.completed {
		background: #6b5b95;
		color: #e2d8f0;
	}

	.status-badge.archived {
		background: #4a5568;
		color: #e2e8f0;
	}

	.welcome-title {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
		z-index: 100;
		pointer-events: none;
		animation: titleFadeInOut 2.5s ease-in-out forwards;
	}

	@media (max-width: 767px) {
		.welcome-title {
			animation: titleFadeInOutMobile 1.5s ease-in-out forwards;
		}

		.welcome-title h1 {
			font-size: 1.8rem;
		}

		.welcome-title p {
			font-size: 0.8rem;
		}
	}

	@keyframes titleFadeInOutMobile {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.9);
		}
		25% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		75% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.05);
		}
	}

	.welcome-title h1 {
		font-size: 2.5rem;
		color: #ffd700;
		margin: 0;
		text-shadow: 
			0 0 20px rgba(255, 215, 0, 0.8),
			0 0 40px rgba(255, 215, 0, 0.5),
			0 0 60px rgba(255, 215, 0, 0.3);
		letter-spacing: 0.1em;
	}

	.welcome-title p {
		font-size: 1rem;
		color: #a8a8b8;
		margin: 0.5rem 0 0 0;
		text-transform: uppercase;
		letter-spacing: 0.3em;
	}

	@keyframes titleFadeInOut {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.9);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		85% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(1.05);
		}
	}

	@media (max-width: 767px) {
		.welcome-title h1 {
			font-size: 1.8rem;
		}

		.welcome-title p {
			font-size: 0.8rem;
		}
	}

	/* ========== STATS PANEL STYLES ========== */

	/* Toggle Button */
	.stats-panel-toggle {
		position: fixed;
		top: 20px;
		left: 20px;
		width: 48px;
		height: 48px;
		background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
		border: 2px solid #ffd700;
		border-radius: 12px;
		cursor: pointer;
		z-index: 950;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		color: #ffd700;
		box-shadow:
			0 0 20px rgba(255, 215, 0, 0.3),
			0 4px 12px rgba(0, 0, 0, 0.5);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0;
	}

	.stats-panel-toggle:hover:not(.open) {
		transform: scale(1.05);
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.5),
			0 4px 16px rgba(0, 0, 0, 0.6);
	}

	.stats-panel-toggle.open:hover {
		box-shadow:
			0 0 30px rgba(255, 215, 0, 0.5),
			0 4px 16px rgba(0, 0, 0, 0.6);
	}

	.stats-panel-toggle.open {
		transform: translateX(380px) rotate(180deg);
	}

	/* Panel and Backdrop */
	.stats-panel {
		position: fixed;
		top: 0;
		left: 0;
		width: 380px;
		height: 100vh;
		background: linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%);
		border-right: 2px solid #ffd700;
		box-shadow:
			4px 0 40px rgba(255, 215, 0, 0.3),
			8px 0 80px rgba(255, 215, 0, 0.15);
		z-index: 900;
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
	}

	/* Custom scrollbar styling for stats panel */
	.stats-panel::-webkit-scrollbar {
		width: 10px;
	}

	.stats-panel::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.3);
		border-left: 1px solid rgba(255, 215, 0, 0.1);
	}

	.stats-panel::-webkit-scrollbar-thumb {
		background: linear-gradient(180deg, #ffd700 0%, #b7941f 100%);
		border-radius: 5px;
		border: 2px solid rgba(0, 0, 0, 0.3);
	}

	.stats-panel::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(180deg, #ffed4e 0%, #d4af37 100%);
	}

	.stats-panel.visible {
		transform: translateX(0);
	}

	.stats-panel-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 899;
		transition: opacity 0.2s ease;
	}

	/* Character Card */
	.character-card {
		padding: 2rem 1.5rem;
		border-bottom: 2px solid rgba(255, 215, 0, 0.2);
		text-align: center;
	}

	.character-portrait {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		border: 3px solid #ffd700;
		box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
		margin: 0 auto 1rem;
		object-fit: cover;
	}

	.character-stats-bar {
		display: flex;
		justify-content: center;
		gap: 2rem;
		margin-bottom: 1rem;
		font-size: 0.9rem;
		color: #a8a8b8;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-label {
		font-weight: bold;
		color: #ffd700;
		text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}

	.character-name {
		font-size: 1.4rem;
		font-weight: bold;
		color: #ffd700;
		text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
		margin-bottom: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.character-title {
		font-size: 0.85rem;
		color: #a8a8b8;
		font-style: italic;
	}

	/* Skills Section */
	.skills-section {
		padding: 1.5rem;
	}

	.proficiency-summary {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 215, 0, 0.2);
		border-radius: 8px;
		padding: 1rem;
		margin-bottom: 1.5rem;
	}

	.proficiency-summary h3 {
		color: #ffd700;
		font-size: 0.9rem;
		margin-bottom: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.proficiency-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem 0;
		font-size: 0.85rem;
	}

	.proficiency-label {
		color: #e0e0e0;
	}

	.proficiency-count {
		color: #ffd700;
		font-weight: bold;
	}

	.skill-branch {
		margin-bottom: 1.5rem;
	}

	.branch-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.branch-header:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(255, 215, 0, 0.3);
	}

	.branch-icon {
		width: 32px;
		height: 32px;
		filter: drop-shadow(0 0 8px rgba(249, 168, 37, 0.5));
	}

	.branch-title {
		flex: 1;
		font-size: 1rem;
		font-weight: bold;
		color: #f9a825;
		text-shadow: 0 0 10px rgba(249, 168, 37, 0.3);
	}

	.branch-count {
		font-size: 0.8rem;
		color: #888;
	}

	.expand-icon {
		font-size: 0.8rem;
		color: #666;
		transition: transform 0.2s ease;
	}

	.expand-icon.expanded {
		transform: rotate(180deg);
	}

	.skill-list {
		margin-top: 0.5rem;
		padding-left: 1rem;
		overflow: hidden;
	}

	.skill-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.75rem;
		margin-bottom: 0.25rem;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 6px;
		border-left: 3px solid transparent;
		transition: all 0.15s ease;
	}

	.skill-item:hover {
		background: rgba(255, 255, 255, 0.05);
		border-left-color: #f9a825;
	}

	.skill-item-icon {
		width: 20px;
		height: 20px;
		opacity: 0.8;
	}

	.skill-name {
		flex: 1;
		font-size: 0.85rem;
		color: #e0e0e0;
	}

	.skill-proficiency {
		font-size: 0.7rem;
		color: #a8a8b8;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.proficiency-stars {
		color: #ffd700;
		font-size: 0.75rem;
	}

	.skill-years {
		font-size: 0.7rem;
		color: #666;
		margin-left: 0.5rem;
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.stats-panel-toggle {
			bottom: 20px;
			left: 20px;
			top: auto;
			width: 44px;
			height: 44px;
			font-size: 22px;
		}

		.stats-panel-toggle.open {
			transform: translateY(-85vh) rotate(180deg);
		}

		.stats-panel {
			width: 100%;
			height: 85vh;
			border-left: none;
			border-right: none;
			border-top: 2px solid #ffd700;
			border-radius: 16px 16px 0 0;
			top: auto;
			bottom: 0;
			transform: translateY(100%);
			box-shadow:
				0 -4px 40px rgba(255, 215, 0, 0.3),
				0 -8px 80px rgba(255, 215, 0, 0.15);
		}

		.stats-panel.visible {
			transform: translateY(0);
		}

		.character-portrait {
			width: 100px;
			height: 100px;
		}

		.character-name {
			font-size: 1.2rem;
		}

		.character-stats-bar {
			gap: 1rem;
			font-size: 0.8rem;
		}
	}
</style>