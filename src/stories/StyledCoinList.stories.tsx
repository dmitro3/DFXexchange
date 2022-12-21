import StyledCoinListItem from './StyledCoinListItem';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { AssetIconVariant } from './DfxAssetIcon';
import StyledCoinList from './StyledCoinList';
import { Protocol } from '../hooks/blockchain.hook';

export default {
  title: 'Composites/CoinListing',
  component: StyledCoinList,
} as ComponentMeta<typeof StyledCoinList>;

export const CoinListingRow: ComponentStory<typeof StyledCoinList> = (args) => {
  return (
    <div className="bg-white p-10">
      <StyledCoinList {...args}>
        <StyledCoinListItem
          asset={AssetIconVariant.ETH}
          onClick={() => {
            console.log('clicked');
          }}
          protocol={Protocol.ERC_20}
        />
        <StyledCoinListItem
          asset={AssetIconVariant.USDT}
          onClick={() => {
            console.log('clicked');
          }}
          protocol={Protocol.ERC_20}
        />
        <StyledCoinListItem
          asset={AssetIconVariant.USDC}
          onClick={() => {
            console.log('clicked');
          }}
          protocol={Protocol.ERC_20}
        />
        <StyledCoinListItem
          asset="BSC-USD"
          onClick={() => {
            console.log('clicked');
          }}
          protocol={Protocol.ERC_20}
        />{' '}
        <StyledCoinListItem
          asset={AssetIconVariant.USDT}
          onClick={() => {
            console.log('clicked');
          }}
          protocol={Protocol.ERC_20}
        />
        <StyledCoinListItem
          asset={AssetIconVariant.USDC}
          onClick={() => {
            console.log('clicked');
          }}
          protocol={Protocol.ERC_20}
        />
      </StyledCoinList>
    </div>
  );
};
CoinListingRow.args = {
  heading: 'Ethereum mainnet · ERC-20 token',
};
