import {  BrowserRouter, Route, Routes } from "react-router-dom";
import CheckCoupons from "./page";

// import './App.css'

function App() {

  return (
    <>
       <BrowserRouter>

<Routes>
<Route path={"/"} exact={true} element={<CheckCoupons />}></Route>
</Routes>
</BrowserRouter>
    </>
  )
}

export default App
