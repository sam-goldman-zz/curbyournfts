import { ethers } from 'ethers';

// const style = "border border-inherit bg-white h-9 w-40 rounded-xl text-center py-1 absolute top-2 right-44";
const style = "border bg-white rounded-xl px-2 py-1 transition hover:bg-yellow-200";

const UserAccount = ({account}) => {
  // Returns a shortened version of the user's account
  const getDisplayAccount = (account) => {
    const checksumAccount = ethers.utils.getAddress(account); // converts account from lowercase to camelcase
    const firstHalf = checksumAccount.slice(0, 6);
    const secondHalf = checksumAccount.slice(-4);
    return `${firstHalf}...${secondHalf}`;
  }

  const displayAccount = getDisplayAccount(account);
  return (
    <div className={style}>{displayAccount}</div>
  )
}

export default UserAccount;