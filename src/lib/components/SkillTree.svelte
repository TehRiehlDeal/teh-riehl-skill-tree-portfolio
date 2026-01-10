<script lang="ts">
	import { onMount } from 'svelte';
	import { Application, Graphics, Container, Assets, Sprite } from 'pixi.js';
	import { gsap } from 'gsap';
	import { treeNodes, categoryColors, type TreeNode } from '$lib/data';

	let container: HTMLDivElement;
	let selectedNode: TreeNode | null = null;
	let modalVisible = false;

	// Tooltip state
	let hoveredNode: TreeNode | null = null;
	let tooltipX = 0;
	let tooltipY = 0;

	// Screen size detection
	let isMobile = false;
	let windowWidth = 0;
	let windowHeight = 0;

	function openModal(node: TreeNode) {
		selectedNode = node;
		modalVisible = true;
		// Hide tooltip when modal opens
		hoveredNode = null;
	}

	function closeModal() {
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
			skills: '#95e1d3',
			education: '#dda0dd',
		};
		return colorMap[category];
	}

	// Update screen size
	function handleResize() {
		windowWidth = window.innerWidth;
		windowHeight = window.innerHeight;
		isMobile = windowWidth < 768;
	}

	onMount(async () => {
		handleResize();
		window.addEventListener('resize', handleResize);

		const app = new Application();

		await app.init({
			background: '#05050a',
			resizeTo: container,
			antialias: true,
		});

		container.appendChild(app.canvas);

		// ========== BACKGROUND LAYER (Stars + Particles) ==========
		const backgroundContainer = new Container();
		app.stage.addChild(backgroundContainer);

		// Create starfield
		const stars: { graphics: Graphics; speed: number; baseAlpha: number }[] = [];
		const starCount = isMobile ? 80 : 150;

		for (let i = 0; i < starCount; i++) {
			const star = new Graphics();
			const size = Math.random() * 2 + 0.5;
			const alpha = Math.random() * 0.6 + 0.2;

			star
				.circle(0, 0, size)
				.fill({ color: 0xffffff, alpha: alpha });

			star.x = Math.random() * app.screen.width;
			star.y = Math.random() * app.screen.height;

			backgroundContainer.addChild(star);
			stars.push({
				graphics: star,
				speed: Math.random() * 0.3 + 0.1,
				baseAlpha: alpha,
			});

			gsap.to(star, {
				alpha: alpha * 0.3,
				duration: Math.random() * 2 + 1,
				ease: 'sine.inOut',
				yoyo: true,
				repeat: -1,
				delay: Math.random() * 2,
			});
		}

		// Create floating particles (fewer on mobile)
		const particles: {
			graphics: Graphics;
			vx: number;
			vy: number;
			baseX: number;
			baseY: number;
		}[] = [];
		const particleCount = isMobile ? 20 : 40;
		const particleColors = [0x4ecdc4, 0xff6b6b, 0x95e1d3, 0xdda0dd, 0xffd700];

		for (let i = 0; i < particleCount; i++) {
			const particle = new Graphics();
			const size = Math.random() * 20 + 10;
			const color = particleColors[Math.floor(Math.random() * particleColors.length)];

			particle
				.circle(0, 0, size)
				.fill({ color: color, alpha: 0.03 });
			particle
				.circle(0, 0, size * 0.6)
				.fill({ color: color, alpha: 0.05 });
			particle
				.circle(0, 0, size * 0.3)
				.fill({ color: color, alpha: 0.08 });

			const x = Math.random() * app.screen.width;
			const y = Math.random() * app.screen.height;
			particle.x = x;
			particle.y = y;

			backgroundContainer.addChild(particle);
			particles.push({
				graphics: particle,
				vx: (Math.random() - 0.5) * 0.3,
				vy: (Math.random() - 0.5) * 0.3,
				baseX: x,
				baseY: y,
			});
		}

		app.ticker.add(() => {
			particles.forEach((p) => {
				p.graphics.x += p.vx;
				p.graphics.y += p.vy;

				if (p.graphics.x < -50) p.graphics.x = app.screen.width + 50;
				if (p.graphics.x > app.screen.width + 50) p.graphics.x = -50;
				if (p.graphics.y < -50) p.graphics.y = app.screen.height + 50;
				if (p.graphics.y > app.screen.height + 50) p.graphics.y = -50;
			});
		});

		// Vignette
		const vignette = new Graphics();
		const vignetteSize = Math.max(app.screen.width, app.screen.height);

		for (let i = 20; i >= 0; i--) {
			const ratio = i / 20;
			const alpha = ratio * ratio * 0.7;
			vignette
				.circle(app.screen.width / 2, app.screen.height / 2, vignetteSize * (0.5 + ratio * 0.5))
				.fill({ color: 0x000000, alpha: alpha * 0.1 });
		}
		backgroundContainer.addChild(vignette);

		// ========== TREE CONTAINER ==========
		const treeContainer = new Container();
		app.stage.addChild(treeContainer);

		treeContainer.x = app.screen.width / 2;
		treeContainer.y = app.screen.height / 2;

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

		app.canvas.addEventListener('touchmove', (e: TouchEvent) => {
			if (e.touches.length === 1 && isDragging && !isTouchZooming) {
				// Single touch - panning
				const dx = e.touches[0].clientX - dragStartX;
				const dy = e.touches[0].clientY - dragStartY;
				if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
					hasMoved = true;
				}
				treeContainer.x = containerStartX + dx;
				treeContainer.y = containerStartY + dy;
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
					return 20 * mobileFactor;
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

		const profileTexture = await Assets.load('/profile.jpg');

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

				profileContainer.on('pointerup', () => {
					if (!hasMoved) {
						openModal(node);
					}
				});

				profileContainer.on('pointerover', () => {
					gsap.to(profileContainer.scale, { x: 1.2, y: 1.2, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1.5, duration: 0.2 });
					if (!isMobile) hoveredNode = node;
				});

				profileContainer.on('pointerout', () => {
					gsap.to(profileContainer.scale, { x: 1, y: 1, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1, duration: 0.2 });
					hoveredNode = null;
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

				nodeContainer.on('pointerup', () => {
					if (!hasMoved) {
						openModal(node);
					}
				});

				nodeContainer.on('pointerover', () => {
					gsap.to(nodeContainer.scale, { x: 1.2, y: 1.2, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1.5, duration: 0.2 });
					if (!isMobile) hoveredNode = node;
				});

				nodeContainer.on('pointerout', () => {
					gsap.to(nodeContainer.scale, { x: 1, y: 1, duration: 0.2 });
					gsap.to(glowGraphics, { alpha: 1, duration: 0.2 });
					hoveredNode = null;
				});

				treeContainer.addChild(nodeContainer);
				nodeObjects.push({ graphics: nodeContainer, node, glowGraphics });
			}
		}

		// ========== ENTRANCE ANIMATIONS ==========
		lineObjects
			.sort((a, b) => getDistanceFromOrigin(a.node) - getDistanceFromOrigin(b.node))
			.forEach((line, index) => {
				gsap.to(line.graphics, {
					alpha: 1,
					duration: 0.4,
					delay: index * 0.06,
					ease: 'power2.out',
				});
				gsap.to(line.glowGraphics, {
					alpha: 1,
					duration: 0.6,
					delay: index * 0.06 + 0.1,
					ease: 'power2.out',
				});
			});

		nodeObjects
			.sort((a, b) => getDistanceFromOrigin(a.node) - getDistanceFromOrigin(b.node))
			.forEach((obj, index) => {
				const delay = index * 0.06;

				gsap.to(obj.graphics, {
					alpha: 1,
					duration: 0.5,
					delay: delay,
					ease: 'back.out(1.7)',
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

				gsap.to(obj.glowGraphics.scale, {
					x: 1.4,
					y: 1.4,
					duration: 2 + Math.random() * 1,
					delay: delay + 0.8,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1,
				});
			});

		console.log('✨ Responsive skill tree loaded!');

		return () => {
			window.removeEventListener('resize', handleResize);
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

			<!-- Links (for projects) -->
			{#if selectedNode.projectUrl || selectedNode.repoUrl}
				<div class="links">
					{#if selectedNode.projectUrl}
						<a href={selectedNode.projectUrl} target="_blank" rel="noopener noreferrer">🔗 Live Site</a>
					{/if}
					{#if selectedNode.repoUrl}
						<a href={selectedNode.repoUrl} target="_blank" rel="noopener noreferrer">💻 Repository</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}

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
</style>