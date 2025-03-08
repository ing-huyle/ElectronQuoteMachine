import './assets/main.scss'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, BrowserRouter as Router, Routes } from 'react-router'
import Window from './components/Window'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='left' element={<Window position='left' />} />
        <Route path='right' element={<Window position='right' />} />
      </Routes>
    </Router>
  </React.StrictMode>
)
