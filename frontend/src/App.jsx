
import {React, useState} from 'react'
import { Routes, Route } from 'react-router-dom'
import FlipStory from './components/FlipStory'
import FlipStory2 from './components/FlipStory2'
import GodAct1 from './components/GodAct1'
import GodAct2 from './components/GodAct2'
import GodAct3 from './components/GodAct3'
import GodAct4 from './components/GodAct4'
import GodAct5 from './components/GodAct5'
import GodAct6 from './components/GodAct6'
import GodAct7 from './components/GodAct7'
import GodAct8 from './components/GodAct8'
import GodAct9 from './components/GodAct9'
import PetAct1 from './components/PetAct1'
import PetAct2 from './components/PetAct2'
import PetAct3 from './components/PetAct3'
import PetAct4 from './components/PetAct4'
import PetAct5 from './components/PetAct5'
import PetAct6 from './components/PetAct6'
import PetAct7 from './components/PetAct7'
import PetAct8 from './components/PetAct8'
import PetAct9 from './components/PetAct9'
import PetAct10 from './components/PetAct10'
import PetAct11 from './components/PetAct11'
import PetAct12 from './components/PetAct12'
import PetAct13 from './components/PetAct13'
import PetAct14 from './components/PetAct14'
import PetAct15 from './components/PetAct15'
import Paragraph from './components/Paragraph'
import AiPeter from './components/AiPeter'
function App() {


  return (
  
     
     <Routes>
      <Route path="/" element={<FlipStory2 />} />
      <Route path="/flipstory2" element={<FlipStory />} />
      <Route path="/GodAct1" element={<GodAct1 />} />
      <Route path="/GodAct2" element={<GodAct2 />} />
      <Route path="/GodAct3" element={<GodAct3 />} />
      <Route path="/GodAct4" element={<GodAct4 />} />
      <Route path="/GodAct5" element={<GodAct5 />} />
      <Route path="/GodAct6" element={<GodAct6 />} />
      <Route path="/GodAct7" element={<GodAct7 />} />
      <Route path="/GodAct8" element={<GodAct8 />} />
      <Route path="/GodAct9" element={<GodAct9 />} />
      <Route path="/PetAct1" element={<PetAct1 />} />
      <Route path="/PetAct2" element={<PetAct2 />} />
      <Route path="/PetAct3" element={<PetAct3 />} />
      <Route path="/PetAct4" element={<PetAct4 />} />
      <Route path="/PetAct5" element={<PetAct5 />} />
      <Route path="/PetAct6" element={<PetAct6 />} />
      <Route path="/PetAct7" element={<PetAct7 />} />
      <Route path="/PetAct8" element={<PetAct8 />} />
      <Route path="/PetAct9" element={<PetAct9 />} />
      <Route path="/PetAct10" element={<PetAct10 />} />
      <Route path="/PetAct11" element={<PetAct11 />} />
      <Route path="/PetAct12" element={<PetAct12 />} />
      <Route path="/PetAct13" element={<PetAct13 />} />
      <Route path="/PetAct14" element={<PetAct14 />} />
      <Route path="/PetAct15" element={<PetAct15 />} />
      <Route path="/Paragraph" element={<Paragraph />} />
      <Route path="/Aipeter" element={<AiPeter />} />

    </Routes>
  )
}

export default App
