import { derived, writable } from 'svelte/store';
import {
	resources as mResources,
	counterHistory as mCounterHistory,
	upgradeStatus as mUpgradeStatus,
	unlockedUpgrades as mUnlockedUpgrades,
	gameStatus as mGameStatus,
	poisonAmount as mPoisonAmount,
} from './matterStores';
import {
	resources as amResources,
	counterHistory as amCounterHistory,
	upgradeStatus as amUpgradeStatus,
	unlockedUpgrades as amUnlockedUpgrades,
	gameStatus as amGameStatus,
	poisonAmount as amPoisonAmount,
} from './antimatterStores';

import options from './optionStores';

export const amDimension = writable(false);

// Player info / random
export const combinedStore = derived(
	[amDimension, options, mResources, mCounterHistory, mUpgradeStatus, mUnlockedUpgrades, mGameStatus, mPoisonAmount,
	amResources, amCounterHistory, amUpgradeStatus, amUnlockedUpgrades, amGameStatus, amPoisonAmount],
	([$amDimension, $options, $mResources, $mCounterHistory, $mUpgradeStatus, $mUnlockedUpgrades, $mGameStatus, $mPoisonAmount,
	$amResources, $amCounterHistory, $amUpgradeStatus, $amUnlockedUpgrades, $amGameStatus, $amPoisonAmount]) => {

	return {
		amDimension: $amDimension,
		options: $options,
		resources: {
			matter: $mResources,
			antimatter: $amResources,
		},
		mCounterHistory: {
			matter: $mCounterHistory,
			antimatter: $amCounterHistory,
		},
		mUpgradeStatus: {
			matter: $mUpgradeStatus,
			antimatter: $amUpgradeStatus,
		},
		mUnlockedUpgrades: {
			matter: $mUnlockedUpgrades,
			antimatter: $amUnlockedUpgrades,
		},
		mGameStatus: {
			matter: $mGameStatus,
			antimatter: $mGameStatus,
		},
		mPoisonAmount: {
			matter: $mPoisonAmount,
			antimatter: $amPoisonAmount,
		},
	};
});

export const currentStore = derived(
	[amDimension, options, mResources, mCounterHistory, mUpgradeStatus, mUnlockedUpgrades, mGameStatus, mPoisonAmount,
	amResources, amCounterHistory, amUpgradeStatus, amUnlockedUpgrades, amGameStatus, amPoisonAmount],
	([$amDimension, $options, $mResources, $mCounterHistory, $mUpgradeStatus, $mUnlockedUpgrades, $mGameStatus, $mPoisonAmount,
	$amResources, $amCounterHistory, $amUpgradeStatus, $amUnlockedUpgrades, $amGameStatus, $amPoisonAmount]) => {

	return {
		amDimension: $amDimension,
		options: $options,
		resources: $amDimension ? $amResources : $mResources,
		upgradeStatus: $amDimension ? $amUpgradeStatus : $mUpgradeStatus,
		unlockedUpgrades: $amDimension ? $amUnlockedUpgrades : $mUnlockedUpgrades,
		gameStatus: $amDimension ? $amGameStatus : $mGameStatus,
		poisonAmount: $amDimension ? $amPoisonAmount : $mPoisonAmount,
		counterHistory: $amDimension ? $amCounterHistory : $mCounterHistory,
	};
});
