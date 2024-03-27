// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import View from './View';

// Add reverse function
const reverse = () => {
  let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  console.log(arr);

  //reverse the array using for loop
  let reversedArr = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    reversedArr.push(arr[i]);
  }
  console.log(reversedArr);
};

reverse();

const App: React.FC = () => {

  return <div className="App">
    <View />
  </div>
};

export default App;

