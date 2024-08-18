interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string;
  }
  
  interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
  }
  
  class Datasource {
    private url: string;
  
    constructor(url: string) {
      this.url = url;
    }
  
    async getPrices(): Promise<Record<string, number>> {
      const response = await fetch(this.url);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      return response.json();
    }
  }
  
  interface Props extends BoxProps {

  }
  
  const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances();
    const [prices, setPrices] = useState<Record<string, number>>({});
  
    useEffect(() => {
      const datasource = new Datasource("https://interview.switcheo.com/prices.json");
      datasource.getPrices()
        .then(setPrices)
        .catch(error => console.error(error));
    }, []);
  
    const getPriority = (blockchain: string): number => {
      const priorities: Record<string, number> = {
        'Osmosis': 100,
        'Ethereum': 50,
        'Arbitrum': 30,
        'Zilliqa': 20,
        'Neo': 20
      };
      return priorities[blockchain] ?? -99;
    }
  
    const sortedBalances = useMemo(() => {
      return balances
        .filter((balance: WalletBalance) => {
          const balancePriority = getPriority(balance.blockchain);
          return balancePriority > -99 && balance.amount > 0;
        })
        .sort((lhs: WalletBalance, rhs: WalletBalance) => {
          return getPriority(lhs.blockchain) - getPriority(rhs.blockchain);
        });
    }, [balances]);
  
    const formattedBalances = useMemo(() => 
      sortedBalances.map((balance: WalletBalance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2) 
      }))
    , [sortedBalances]);
  
    const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] ? prices[balance.currency] * balance.amount : 0;
      return (
        <WalletRow 
          className={classes.row}
          key={balance.currency} 
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  
    return (
      <div {...rest}>
        {rows}
      </div>
    );
  }
  