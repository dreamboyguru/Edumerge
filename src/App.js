// import logo from './logo.svg';
import './App.css';
import Links from './components/Links';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NoPage from './components/NoPage';
import Layout from './components/Layout';
import Credencial from './components/Credencial';
import Admission from './components/configKeys/Admission';
// import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <Layout />
      <Routes>
        <Route path="/" element={<Links />} />
        <Route path="/Credencial" element={<Credencial />} />
        <Route path="*" element={<NoPage />} />
        <Route path="/admission" element={<Admission />} />
      </Routes>
        {/* <Route path="/" element={<Home />}>
          <Route index element={<Home />} />
          <Route path="/Credencial" element={<Credencial />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes> */}
    </BrowserRouter>
  );
}

export default App;
