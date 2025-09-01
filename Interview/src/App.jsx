import React from 'react'
import Home from './pages/Home.jsx'
import Form from './components/home/Form.jsx'
import GenerateLink from './components/home/GenerateLink.jsx'
import Test from './components/home/Test.jsx'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/:id" element={<Test />} />
        <Route path="/form" element={<Form />} />
        <Route path="/link" element={<GenerateLink />} />
      </Routes>
    </Router>
  )
}

export default App;