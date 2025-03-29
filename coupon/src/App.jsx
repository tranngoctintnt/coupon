import {  BrowserRouter, Route, Routes } from "react-router-dom";

import Coupon from "./Coupon";
import './index.css'
import CheckCoupons from "./admin";
function App() {

  return (
    <>
      <BrowserRouter>

      <Routes>
      <Route path={"/"} exact={true} element={<Coupon />}></Route>
      <Route path={"/admin"} exact={true} element={<CheckCoupons/>}></Route>

      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
