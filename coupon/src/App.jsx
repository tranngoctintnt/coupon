import {  BrowserRouter, Route, Routes } from "react-router-dom";

import Coupon from "./Coupon";
import './index.css'

function App() {

  return (
    <>
      <BrowserRouter>

      <Routes>
      <Route path={"/"} exact={true} element={<Coupon />}></Route>

      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
