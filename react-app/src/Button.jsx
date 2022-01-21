const style = "mt-20 bg-gradient-to-r from-red-600 via-pink-400 to-indigo-500 hover:from-red-500 hover:via-pink-400 hover:to-indigo-400 disabled:from-red-200 disabled:via-pink-200 disabled:to-indigo-200 text-white text-xl rounded-2xl h-10 w-60 transition hover:scale-110";

const Button = (props) => {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      className={style}>
        {props.name}
    </button>
  )
}

export default Button;