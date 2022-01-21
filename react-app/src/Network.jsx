const style = "border border-inherit bg-white h-9 w-40 rounded-xl text-center py-1 absolute top-2 right-2";

const Network = ({network}) => {
  return <div className={style}>{network}</div>
};

export default Network;