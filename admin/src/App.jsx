
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckCoupons from "./page";
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
