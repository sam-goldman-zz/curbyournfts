

const a = async () => {
  setTimeout(() => console.log('bye'), 5000);
}

const b = async () => {
  setTimeout(() => console.log('chi'), 2000);
}

a();

b();

console.log('hi');