const style = "mt-4 bg-yellow-400 disabled:bg-yellow-200 text-white text-xl rounded-lg h-10 w-60 transition hover:scale-110";

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