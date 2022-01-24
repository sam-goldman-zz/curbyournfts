const verify = async () => {
  await hre.run("verify:verify", {
    address: '0x4a3844F8B63ffb024aE7b5d3BD613f8AD7bcB43b',
    constructorArguments: [
      40,
      ['0x4856e043a1F2CAA8aCEfd076328b4981Aca91000',],
    ],
  });
}

verify();