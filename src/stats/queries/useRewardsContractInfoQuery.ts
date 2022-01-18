import { useQuery, UseQueryResult } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber, ethers } from 'ethers';
import { abi } from 'constants/abis/StakingRewards.json'
import { Web3Provider } from '@ethersproject/providers'
import { useActiveWeb3React } from 'hooks'

export interface RewardsContractInfo {
	duration: number;
	rate: number;
	totalSupply: number;
	periodFinish: number;
	userScore: number;
}

export interface RewardsData {
	price: number | null;
	apy: number | null;
	distribution: number | null;
	rewardsInfo: RewardsContractInfo | null;
	queries: UseQueryResult[];
}

export const useRewardsContractInfo = (
	provider: Web3Provider,
	fromToken: string,
	contractAddress: string
) => {
	const rewardsContract = new ethers.Contract(
		contractAddress,
		abi,
		provider
	);

	const { account } = useActiveWeb3React()

	const rewardsInfo = useQuery<RewardsContractInfo, string>(
		QUERY_KEYS.RewardsInfo(contractAddress),
		async () => {
			const rawRewardsContractInfo = await Promise.all([
				rewardsContract.DURATION ? rewardsContract.DURATION() : rewardsContract.rewardsDuration(),
				rewardsContract.rewardRate(),
				rewardsContract.totalSupply(),
				rewardsContract.periodFinish(),
				rewardsContract.getUserScore(account),
			]);

			return {
				duration: rawRewardsContractInfo[0].toNumber(),
				rate: Number(ethers.utils.formatEther(rawRewardsContractInfo[1])),
				totalSupply: Number(ethers.utils.formatEther(rawRewardsContractInfo[2])),
				periodFinish: rawRewardsContractInfo[3].toNumber(),
				userScore: rawRewardsContractInfo[4].toNumber(),
			};
		}
	);

	const price = BigNumber.from('30000000000000000');

	const SNXPrice = BigNumber.from('30000000000000000');

	let distribution = null;
	if (rewardsInfo.isSuccess) {
		const d = rewardsInfo.data;
		const durationInWeeks = d.duration / (3600 * 24 * 7);
		const isPeriodFinished = new Date().getTime() > Number(d.periodFinish) * 1000;

		distribution = isPeriodFinished ? 0 : (d.duration * d.rate) / durationInWeeks;
	}

	let apy = 0;

	if (rewardsInfo.isSuccess) {
		apy =
			(rewardsInfo.data.rate *
				(365 * 24 * 60 * 60) *
				Number(ethers.utils.formatEther(SNXPrice))) /
			rewardsInfo.data.totalSupply /
			Number(ethers.utils.formatEther(price!));
	}

	const queries: UseQueryResult[] = [rewardsInfo];

	return {
		price: price ? Number(ethers.utils.formatEther(price!)) : null,
		rewardsInfo: rewardsInfo.data,
		distribution,
		apy: apy || null,
		queries,
	};
};