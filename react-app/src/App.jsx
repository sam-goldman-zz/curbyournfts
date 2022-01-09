import logo from './logo.svg';
import './App.css';

function App() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
  }
  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;