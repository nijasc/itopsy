export { default as Icon } from './Icon.svelte';

type Node = [tag: string, attrs: Record<string, string>];

export const sunIcon: Node[] = [
	['circle', { cx: '12', cy: '12', r: '4' }],
	['path', { d: 'M12 2v2' }],
	['path', { d: 'M12 20v2' }],
	['path', { d: 'm4.93 4.93 1.41 1.41' }],
	['path', { d: 'm17.66 17.66 1.41 1.41' }],
	['path', { d: 'M2 12h2' }],
	['path', { d: 'M20 12h2' }],
	['path', { d: 'm6.34 17.66-1.41 1.41' }],
	['path', { d: 'm19.07 4.93-1.41 1.41' }]
];

export const moonIcon: Node[] = [
	[
		'path',
		{
			d: 'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'
		}
	]
];

export const userIcon: Node[] = [
	['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }],
	['circle', { cx: '12', cy: '7', r: '4' }]
];

export const layoutDashboardIcon: Node[] = [
	['rect', { width: '7', height: '9', x: '3', y: '3', rx: '1' }],
	['rect', { width: '7', height: '5', x: '14', y: '3', rx: '1' }],
	['rect', { width: '7', height: '9', x: '14', y: '12', rx: '1' }],
	['rect', { width: '7', height: '5', x: '3', y: '16', rx: '1' }]
];

export const usersIcon: Node[] = [
	['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
	['path', { d: 'M16 3.128a4 4 0 0 1 0 7.744' }],
	['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }],
	['circle', { cx: '9', cy: '7', r: '4' }]
];

export const logOutIcon: Node[] = [
	['path', { d: 'm16 17 5-5-5-5' }],
	['path', { d: 'M21 12H9' }],
	['path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }]
];

export const thumbsUpIcon: Node[] = [
	[
		'path',
		{
			d: 'M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z'
		}
	],
	['path', { d: 'M7 10v12' }]
];

export const messageSquareIcon: Node[] = [
	[
		'path',
		{
			d: 'M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z'
		}
	]
];
